use std::sync::Arc;

use chrono::{DateTime, Duration, Utc};
use dashmap::{DashMap, DashSet};
use futures::future::join_all;
use tokio::sync::{mpsc::error::SendError, Mutex};
use tokio_stream::{wrappers::ReceiverStream, StreamExt};
use tonic::Status;
use uuid::Uuid;

use crate::api;
use crate::api::StreamResponses;
use crate::builders;
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
        self.subscribed_node_ids.len()
    }

    pub async fn set_connection(self: Arc<Self>, conn: Arc<Connection>) {
        self.connections.insert(conn.id(), conn.clone());
        // every time a new connections gets set we send a publish of the session
        self.publish_self().await;
        // additionally we resubscribe the connection to all previous subscribed node
        let mut promises = vec![];
        for node_id in self.subscribed_node_ids.iter() {
            promises.push(self.clone().subscribe_to_node(node_id.clone()))
        }
        join_all(promises).await;
    }

    pub async fn remove_connection(&self, connection_id: &Uuid) {
        self.connections.remove(connection_id);
        // every time a connection disconnects we publish the session
        self.publish_self().await;
        // here we need to handle the unsubscribe of subscribed nodes
        let mut promises = vec![];
        for node_id in self.subscribed_node_ids.iter() {
            promises.push(async move {
                self.global_state
                    .unsubscribe_from_node(connection_id, &node_id)
                    .await
            });
        }
        join_all(promises).await;
    }

    pub async fn reset_lifetime(&self) {
        let mut a = self.alive_till.lock().await;
        *a = Utc::now() + Duration::seconds(240);
        println!("Session: Lifetime got reset");
    }

    pub async fn publish_self(&self) {
        let res = self
            .send_single_data(builders::Response::session_stream(self))
            .await;
        match res {
            Ok(_) => {}
            Err(err) => {
                println!("Session: Could not publish itself because of: {:?}", err)
            }
        }
    }

    pub async fn subscribe_to_node(self: Arc<Self>, node_id: Uuid) {
        if let Some(receiver) = self
            .global_state
            .subscribe_to_node(&self.id, &node_id)
            .await
        {
            // we store wich node ids are subscribed
            // like that clients that lost the connection dont have keep track wich values they subscribed
            // is this optimal ?
            self.subscribed_node_ids.insert(node_id);
            tokio::spawn(async move {
                let mut stream = ReceiverStream::new(receiver);
                while let Some(data) = stream.next().await {
                    let err = self
                        .send_single_data(builders::Response::node_stream(&node_id, data))
                        .await;
                    if let Err(err) = err {
                        println!("Connection.listen_to_node: received error - {:?}", err);
                    }
                }
            });
        }
    }

    pub async fn send(
        &self,
        responses: Result<StreamResponses, Status>,
    ) -> Result<(), SendError<Result<StreamResponses, Status>>> {
        let mut promises = vec![];
        for connection in self.connections.iter() {
            let conn = connection.value().clone();
            let r = responses.clone();
            promises.push(async move {
                let prom = conn.send(r);
                prom.await
            });
        }
        join_all(promises).await;
        Ok(())
    }

    pub async fn send_single_data(
        &self,
        response: api::StreamResponse,
    ) -> Result<(), SendError<Result<StreamResponses, Status>>> {
        self.send(Ok(builders::Response::stream_responses(
            [response].to_vec(),
        )))
        .await
    }
}
