use std::sync::Arc;

use async_trait::async_trait;
use chrono::{DateTime, Duration, Utc};
use dashmap::{DashMap, DashSet};
use futures::future::join_all;
use tokio::sync::{mpsc::error::SendError, Mutex};
use tokio_stream::{wrappers::ReceiverStream, StreamExt};
use tonic::Status;
use uuid::Uuid;

use crate::api::{StreamResponse};
use crate::api::StreamResponses;
use crate::builders;
use crate::specs::{Sender, NodeSubscriber, SelfAware};
use crate::{connection::Connection, state::GlobalState};

/**
 * A connection is short lived. Its removed when it dies and then created new
 * longer alive state is implemented during sessions
 */
#[derive(Debug)]
pub struct Session {
    global_state: Arc<GlobalState>,
    alive_till: Arc<Mutex<DateTime<Utc>>>,

    connections: DashMap<Uuid, Arc<Connection>>,

    subscribed_node_ids: DashSet<Uuid>,

    id: Uuid,
}

impl Session {
    pub fn new(global_state: Arc<GlobalState>) -> Session {
        println!("Session: created new session");
        Session {
            global_state,

            id: Uuid::new_v4(),
            connections: DashMap::new(),
            subscribed_node_ids: DashSet::new(),

            // by default a session lives 240 seconds wich a 4 minutes
            alive_till: Arc::new(Mutex::new(Utc::now() + Duration::seconds(240))),
        }
    }

    pub fn id(&self) -> Uuid {
        self.id
    }

    pub fn active_connections(&self) -> usize {
        self.connections.len()
    }

    pub fn subscribed_node_ids(&self) -> Vec<Uuid> {
        self.subscribed_node_ids
            .iter()
            .map(|item| item.key().clone())
            .collect()
    }

    pub async fn add_connection(self: Arc<Self>, conn: Arc<Connection>) {
        self.connections.insert(conn.id(), conn.clone());
        // we resubscribe the connection to all previous subscribed node
        let mut promises = vec![];
        for node_id in self.subscribed_node_ids.iter() {
            promises.push(self.clone().subscribe_to_node(node_id.clone()))
        }
        join_all(promises).await;
        // every time a new connections gets set we send a publish of the session
        self.publish_self().await;
    }

    pub async fn remove_connection(&self, connection_id: &Uuid) {
        self.connections.remove(connection_id);
        // every time a connection disconnects we publish the session
        self.publish_self().await;
    }

    pub async fn reset_lifetime(&self) {
        let mut a = self.alive_till.lock().await;
        *a = Utc::now() + Duration::seconds(240);
        println!("Session: Lifetime got reset");
    }
}

#[async_trait]
impl SelfAware for Session {
    async fn publish_self(&self) {
        let res = self
            .send_single(builders::Response::session_stream(self))
            .await;
        match res {
            Ok(_) => {}
            Err(err) => {
                println!("Session: Could not publish itself because of: {:?}", err)
            }
        }
    }
}

#[async_trait]
impl NodeSubscriber for Session {
    async fn subscribe_to_node(self: Arc<Self>, node_id: Uuid) {
        if let Some(receiver) = self
            .clone()
            .global_state
            .subscribe_to_node(&self.id, &node_id)
            .await
        {
            // we store wich node ids are subscribed
            // like that clients that lost the connection dont have keep track wich values they subscribed
            // is this optimal ?
            self.subscribed_node_ids.insert(node_id);
            let s1 = self.clone();
            tokio::spawn(async move {
                let mut stream = ReceiverStream::new(receiver);
                while let Some(data) = stream.next().await {
                    let err = s1
                        .send_single(builders::Response::node_stream(&node_id, data))
                        .await;
                    if let Err(err) = err {
                        println!("Session.subscribe_to_node: received error - {:?}", err);
                    }
                }
                println!("Session.subscribe_to_node: stopped");
            });
            // when we subscribe to a new node we publish that information to the clients over the session
            self.publish_self().await;
        }
    }

    async fn unsubscribe_from_node(self: Arc<Self>, node_id: Uuid) {
        let mut promises = vec![];
        for connection in self.connections.iter() {
            let s = self.clone();
            promises.push(async move {
                s.subscribed_node_ids.remove(&node_id);
                s.global_state
                    .unsubscribe_from_node(connection.key(), &node_id)
                    .await;
            });
        }
        join_all(promises).await;
        // wehen we unsubscribe from a node we publish that information to the clients over the session
        self.publish_self().await
    }
}

#[async_trait]
impl Sender for Session {
    async fn send_multi(
        &self,
        responses: StreamResponses,
    ) -> Result<(), SendError<Result<StreamResponses, Status>>> {
        let mut promises = vec![];
        for connection in self.connections.iter() {
            let conn = connection.value().clone();
            let r = responses.clone();
            promises.push(async move {
                let prom = conn.send_multi(r);
                prom.await
            });
        }
        join_all(promises).await;
        Ok(())
    }

    async fn send_single(
        &self,
        response: StreamResponse,
    ) -> Result<(), SendError<Result<StreamResponses, Status>>> {
        self.send_multi(builders::Response::stream_responses(
            [response].to_vec(),
        ))
        .await
    }
}