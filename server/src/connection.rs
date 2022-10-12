use async_trait::async_trait;
use chrono::{Utc, Duration};
use dashmap::{DashMap, DashSet};
use futures::future::join_all;
use prost_types::Any;
use std::{str::FromStr, sync::Arc, vec};
use tokio::sync::{
    mpsc,
    mpsc::{error::SendError},
    Mutex,
};
use tonic::Status;
use uuid::Uuid;

use crate::{
    api,
    heartbeat,
    api::{CreateNode, StreamRequests, StreamResponses, UpdateNodeValue, AcquireSession},
    builders,
    runtime::{self, node::Value},
    session::Session,
    state::GlobalState,
    specs::{Sender, NodeSubscriber, SelfAware}
};

use tokio_stream::{wrappers::ReceiverStream, StreamExt};

/**
 * A connection is short lived. Its removed when it dies and then created new
 * longer alive state is implemented during sessions
 */
#[derive(Debug)]
pub struct Connection {
    global_state: Arc<GlobalState>,

    id: Uuid,

    heartbeat: heartbeat::Heartbeat,

    session: Mutex<Option<Arc<Session>>>,

    subscribed_node_ids: DashSet<Uuid>,

    sender: mpsc::Sender<Result<StreamResponses, Status>>,
    receiver: DashMap<Uuid, mpsc::Sender<StreamRequests>>, // ! THIS IS CORRECT
}

impl Connection {
    pub fn new(
        global_state: Arc<GlobalState>,
        sender: mpsc::Sender<Result<StreamResponses, Status>>,
    ) -> Connection {
        Connection {
            global_state,

            id: Uuid::new_v4(),

            heartbeat: heartbeat::Heartbeat::new(Duration::seconds(30)),

            session: Mutex::new(None),
            subscribed_node_ids: DashSet::new(),

            sender: sender,
            receiver: DashMap::new(),
        }
    }

    pub fn id(&self) -> Uuid {
        self.id
    }

    pub fn subscribed_node_ids(&self) -> Vec<Uuid> {
        self.subscribed_node_ids.iter().map(|item| item.key().clone()).collect()
    }

    pub async fn heart_is_beating(&self) -> bool {
        self.heartbeat.heart_is_beating().await
    }

    pub async fn beat_once(&self, client_beat: api::Heartbeat) {
        let client_time = heartbeat::proto_timestamp_as_utc(client_beat.timestamp.unwrap());
        self.heartbeat.beat_once(client_time).await;
        let server_time = self.heartbeat.last_heartbeat().await;
        let latency_ms = self.heartbeat.latency_ms().await;

        println!(
            "Connection.Heartbeat: received client : {:?}, send response: {:?}, latency: {:?}ms",
            client_time.timestamp(),
            server_time.timestamp(),
            latency_ms
        );

        self.send_single(builders::Response::heartbeat_stream(heartbeat::utc_as_proto_timestamp(server_time)))
            .await
            .expect("Connection.Heartbeat: could not send heartbeat to the client");
    }

    pub async fn reset_session_lifetime(&self) {
        let m = self.session.lock().await;
        if m.as_ref().is_some() {
            m.as_ref().unwrap().reset_lifetime().await;
        }
    }

    pub fn listen(&self) -> mpsc::Receiver<StreamRequests> {
        let (sender, receiver) = mpsc::channel::<StreamRequests>(128);
        self.receiver.insert(Uuid::new_v4(), sender);
        receiver
    }

    pub async fn set_session(&self, session: Option<Arc<Session>>) {
        let mut m = self.session.lock().await;
        *m = session;
    }

    async fn acquire_new_session(self: Arc<Self>) {
        let session = Session::new(self.global_state.clone());
        let session = self.global_state.clone().add_session(session);
        session.clone().add_connection(self.clone()).await;
        self.set_session(Some(session)).await;
        println!("Connection: aquired new session");
    }

    async fn acquire_existing_session(self: Arc<Self>, session_token: String) {
        let session_id = Uuid::from_str(&session_token);
        match session_id {
            Ok(session_id) => {
                let session = self.global_state.clone().get_session_by_id(session_id);
                match session {
                    Some(session) => {
                        session.clone().add_connection(self.clone()).await;
                        self.set_session(Some(session)).await;
                        println!("Connection: aquired existing session");
                    }
                    None => self.acquire_new_session().await,
                }
            }
            Err(_) => {
                self.acquire_new_session().await
            }
        }
    }

    pub async fn aquire_session(self: Arc<Self>, aquire_session: AcquireSession) {
        match aquire_session.data.unwrap() {
            api::acquire_session::Data::None(_) => {
                self.acquire_new_session().await
            },
            api::acquire_session::Data::SessionToken(session_token) => {
                self.acquire_existing_session(session_token).await
            }
        }
    }

    pub async fn create_node(
        self: Arc<Self>,
        create_node: CreateNode,
    ) -> Arc<runtime::node::Node<Any>> {
        let data = match create_node.value.unwrap() {
            api::create_node::Value::Some(s) => s.data,
            api::create_node::Value::None(_) => None,
        };
        let n = self.global_state.create_node(data);
        println!("Connection.create_node: node id - {:?}", n.id());
        // we always listen to the node we just created
        self.subscribe_to_node(n.id()).await;
        n
    }

    pub async fn update_node_value(self: Arc<Self>, update_node_value: UpdateNodeValue) {
        match Uuid::from_str(&update_node_value.id) {
            Ok(node_id) => {
                let n = self
                    .global_state
                    .update_node_value(
                        &node_id,
                        Some(Value {
                            value: update_node_value.data.unwrap(),
                            timestamp: Utc::now(),
                        }),
                    )
                    .await;
                match n {
                    Some(n) => println!("Connection.update_node_value: node id - {:?}", n.id()),
                    None => {}
                }
            }
            Err(err) => println!(
                "Connection.update_node_value: Could not parse id - {:?}",
                err
            ),
        }
    }

    pub async fn close(&self) {
        // first we remove it from the session
        let mut session = self.session.lock().await;
        if let Some(session) = session.as_ref() {
            session.remove_connection(&self.id).await;
        }
        // then we remove the session from the connection
        *session = None;

        // we need to unsubscribe from the nodes
        let mut promises = vec![];
        for node_id in self.subscribed_node_ids.iter() {
            promises.push(async move {
                self.global_state
                    .unsubscribe_from_node(&self.id, node_id.key())
                    .await
            })
        }
        join_all(promises).await;

        // at last we remove the connection from the global state
        self.global_state.remove_connection(&self.id);

        println!("Connection.close: closed connection - {:?}", self.id)
    }
}

#[async_trait]
impl SelfAware for Connection {
    async fn publish_self(&self) {
        let res = self
            .send_single(builders::Response::connection_stream(self))
            .await;
        match res {
            Ok(_) => {}
            Err(err) => {
                println!("Connection: Could not publish itself because of: {:?}", err)
            }
        }
    }
}

#[async_trait]
impl NodeSubscriber for Connection {
    async fn subscribe_to_node(self: Arc<Self>, node_id: Uuid) {
        // first we need to decide if we listens as a session or as a connection
        let session = self.session.lock().await;
        if let Some(session) = session.as_ref() {
            session.clone().subscribe_to_node(node_id).await;
            drop(session);
        } else {
            drop(session);
            let receiver = self
                .global_state
                .subscribe_to_node(&self.id, &node_id)
                .await;
            if let Some(receiver) = receiver {
                self.subscribed_node_ids.insert(node_id);
                let s1 = self.clone();
                tokio::spawn(async move {
                    let mut stream = ReceiverStream::new(receiver);
                    while let Some(data) = stream.next().await {
                        let err = s1
                            .send_single(builders::Response::node_stream(&node_id, data))
                            .await;
                        if let Err(err) = err {
                            println!("Connection.subscribe_to_node: received error - {:?}", err);
                        }
                    }
                    println!("Connection.subscribe_to_node: stopped")
                });
                // when we subscribe to a node without a session we publish the information to the client
                self.publish_self().await;
            }
        }
    }

    async fn unsubscribe_from_node(self: Arc<Self>, node_id: Uuid) {
        // first we need to decide if we listens as a session or as a connection
        let session = self.session.lock().await;
        if let Some(session) = session.as_ref() {
            session.clone().unsubscribe_from_node(node_id).await;
            drop(session);
        } else {
            drop(session);
            self.subscribed_node_ids.remove(&node_id);
            self.global_state.unsubscribe_from_node(&self.id(), &node_id).await;
        }
    }
}

#[async_trait]
impl Sender for Connection {
    async fn send_multi(
        &self,
        responses: StreamResponses,
    ) -> Result<(), SendError<Result<StreamResponses, Status>>> {
        // TODO: we need to do batching here (150ms interval?)
        // also the same needs to happen on the client

        // TODO: Find out if batching already happens on the tonic/grpc side

        // in case we receive as send call we start a new batch
        // the batch waits 150ms and then dies

        self.sender.send(Ok(responses)).await
    }

    async fn send_single(
        &self,
        response: api::StreamResponse,
    ) -> Result<(), SendError<Result<StreamResponses, Status>>> {
        self.send_multi(builders::Response::stream_responses([response].to_vec()))
            .await
    }
}