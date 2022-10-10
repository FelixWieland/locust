use std::{str::FromStr, sync::Arc};

use chrono::Utc;
use dashmap::DashMap;
use prost_types::{Any, Timestamp};
use tokio::sync::{
    mpsc::{self, error::SendError, Receiver, Sender},
    Mutex,
};
use tonic::Status;
use uuid::Uuid;

use crate::{
    heartbeat,
    runtime::{self, node::Value},
    server::{
        self,
        api::{
            AquireSession, CreateNode, Heartbeat, NodeValue, StreamRequests, StreamResponse,
            StreamResponses, UpdateNodeValue,
        },
    },
    session::Session,
    state::GlobalState,
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

    last_heartbeat: Arc<Mutex<Heartbeat>>,
    latency_ms: Arc<Mutex<Option<i64>>>,

    session: Mutex<Option<Arc<Session>>>,

    sender: Sender<Result<StreamResponses, Status>>,
    receiver: DashMap<Uuid, Sender<StreamRequests>>, // ! THIS IS CORRECT
}

impl Connection {
    pub fn new(
        global_state: Arc<GlobalState>,
        sender: Sender<Result<StreamResponses, Status>>,
    ) -> Connection {
        Connection {
            global_state,

            id: Uuid::new_v4(),

            last_heartbeat: Arc::new(Mutex::new(Heartbeat {
                timestamp: Some(heartbeat::current_timestamp()),
            })),
            latency_ms: Arc::new(Mutex::new(None)),

            session: Mutex::new(None),

            sender: sender,
            receiver: DashMap::new(),
        }
    }

    pub fn id(&self) -> Uuid {
        self.id
    }

    pub async fn heart_is_beating(&self) -> bool {
        let c = heartbeat::current_timestamp();
        let max_seconds = 10;
        let lts = self.last_heartbeat.lock().await;
        lts.timestamp.is_some() && c.seconds - lts.timestamp.clone().unwrap().seconds < max_seconds
    }

    pub async fn beat_once(&self, client_beat: Heartbeat) {
        let server_beat = heartbeat::current_timestamp();
        let latency_ms =
            heartbeat::calculate_latency_ms(&client_beat.timestamp.clone().unwrap(), &server_beat);

        println!(
            "Connection.Heartbeat: received client : {:?}, send response: {:?}, latency: {:?}ms",
            client_beat.timestamp.unwrap().seconds,
            server_beat.seconds,
            latency_ms
        );

        let mut t = self.last_heartbeat.lock().await;
        let mut l = self.latency_ms.lock().await;

        *t = Heartbeat {
            timestamp: Some(server_beat.clone()),
        };
        *l = Some(latency_ms);

        let m = self.session.lock().await;
        if m.as_ref().is_some() {
            m.as_ref().unwrap().reset_lifetime().await;
        }
        drop(m);

        self.send_single_data(server::api::stream_response::Data::Heartbeat(Heartbeat {
            timestamp: Some(server_beat),
        }))
        .await
        .expect("error sending heartbeat")
    }

    pub async fn send(
        &self,
        responses: Result<StreamResponses, Status>,
    ) -> Result<(), SendError<Result<StreamResponses, Status>>> {
        self.sender.send(responses).await
    }

    pub async fn send_single_data(
        &self,
        data: server::api::stream_response::Data,
    ) -> Result<(), SendError<Result<StreamResponses, Status>>> {
        self.send(Ok(StreamResponses {
            responses: [StreamResponse { data: Some(data) }].to_vec(),
        }))
        .await
    }

    pub fn listen(&self) -> Receiver<StreamRequests> {
        let (sender, receiver) = mpsc::channel::<StreamRequests>(128);
        self.receiver.insert(Uuid::new_v4(), sender);
        receiver
    }

    pub async fn create_node(
        self: Arc<Self>,
        _create_node: CreateNode,
    ) -> Arc<runtime::node::Node<Any>> {
        let n = self.global_state.create_node();
        println!("Connection.create_node: node id - {:?}", n.id());
        // we always listen to the node we just created
        self.listen_to_node(n.id()).await;
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

    pub async fn listen_to_node(self: Arc<Self>, node_id: Uuid) {
        // first we need to decide if we listens as a session or as a connection
        let session = self.session.lock().await;
        if let Some(session) = session.as_ref() {
            session.clone().listen_to_node(node_id).await;
            drop(session);
        } else {
            drop(session);
            if let Some(receiver) = self.global_state.listen_to_node(&node_id).await {
                tokio::spawn(async move {
                    let mut stream = ReceiverStream::new(receiver);
                    while let Some(result) = stream.next().await {
                        let node = match result {
                            Some(v) => server::api::Node {
                                id: node_id.to_string(),
                                value: Some(server::api::node::Value::Some(NodeValue {
                                    timestamp: Some(Timestamp {
                                        seconds: v.timestamp.timestamp(),
                                        nanos: v.timestamp.timestamp_subsec_nanos() as i32,
                                    }),
                                    data: Some(v.value),
                                })),
                            },
                            None => server::api::Node {
                                id: node_id.to_string(),
                                value: None,
                            },
                        };
                        let err = self
                            .send_single_data(server::api::stream_response::Data::Node(node))
                            .await;
                        if let Err(err) = err {
                            println!("Connection.listen_to_node: received error - {:?}", err);
                        }
                    }
                });
            }
        }
    }

    pub async fn set_session(&self, session: Option<Arc<Session>>) {
        let mut m = self.session.lock().await;
        *m = session;
    }

    async fn aquire_new_session(self: Arc<Self>) {
        let session = Session::new(self.global_state.clone());
        let session = self.global_state.clone().add_session(session);
        session.clone().set_connection(self.clone()).await;
        self.set_session(Some(session)).await;
        println!("Connection: aquired new session");
    }

    async fn aquire_existing_session(self: Arc<Self>, session_token: String) {
        let session_id = Uuid::from_str(&session_token);
        match session_id {
            Ok(session_id) => {
                let session = self.global_state.clone().get_session_by_id(session_id);
                match session {
                    Some(session) => {
                        session.clone().set_connection(self.clone()).await;
                        self.set_session(Some(session)).await;
                        println!("Connection: aquired existing session");
                    }
                    None => self.aquire_new_session().await,
                }
            }
            Err(_) => {
                // error in parsing uuid -> create new session
                self.aquire_new_session().await
            },
        }
    }

    pub async fn aquire_session(self: Arc<Self>, aquire_session: AquireSession) {
        match aquire_session.data.unwrap() {
            server::api::aquire_session::Data::None(_) => self.aquire_new_session().await,
            server::api::aquire_session::Data::SessionToken(session_token) => self.aquire_existing_session(session_token).await
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
        // HOW?

        // at last we remove the connection from the global state
        self.global_state.remove_connection(&self.id);

        println!("Connection.close: closed connection - {:?}", self.id)
    }
}
