use std::sync::Arc;

use chrono::{DateTime, Utc, Duration};
use dashmap::{DashMap, DashSet};
use futures::{future::join_all};
use prost_types::Timestamp;
use tokio_stream::{wrappers::ReceiverStream, StreamExt};
use tonic::Status;
use uuid::Uuid;
use tokio::sync::{mpsc::{error::SendError}, Mutex};

use crate::{connection::{Connection}, state::GlobalState, server::{api::{StreamResponses, StreamResponse, NodeValue}, self}};

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
        Session{
            global_state,

            id: Uuid::new_v4(),
            connections: DashMap::new(),
            subscribed_node_ids: DashSet::new(),

            // by default a session lives 240 seconds wich a 4 minutes
            alive_till: Arc::new(Mutex::new(Utc::now() + Duration::seconds(240)))
        }
    }

    pub fn id(&self) -> Uuid {
        self.id
    }

    pub async fn set_connection(self: Arc<Self>, conn: Arc<Connection>) {
        self.connections.insert(conn.id(), conn.clone());
        // every time a new connections gets set we send a publish of the session
        self.publish_self().await;
        // additionally we resubscribe the connection to all previous subscribed node
        let mut promises = vec![];
        for node_id in self.subscribed_node_ids.iter() {
            promises.push(self.clone().listen_to_node(node_id.clone()))
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
                self.global_state.disconnect_from_node(connection_id, &node_id).await
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
        let res = self.send_single_data(server::api::stream_response::Data::Session(server::api::Session{
            session_token: self.id().to_string(),
            active_connections: self.connections.len() as i32
        })).await;
        match res {
            Ok(_) => {},
            Err(err) => {
                println!("Session: Could not publish itself because of: {:?}", err)
            },
        }
    }

    pub async fn listen_to_node(self: Arc<Self>, node_id: Uuid) {
        if let Some(receiver) = self.global_state.listen_to_node(&self.id, &node_id).await {

            // we store wich node ids are subscribed 
            // like that clients that lost the connection dont have keep track wich values they subscribed
            // is this optimal ? 
            self.subscribed_node_ids.insert(node_id);

            tokio::spawn(async move {
                let mut stream = ReceiverStream::new(receiver);
                 while let Some(result) = stream.next().await {
                    let node = match result {
                        Some(v) => server::api::Node{
                            id: node_id.to_string(),
                            value: Some(server::api::node::Value::Some(NodeValue { 
                                timestamp: Some(Timestamp{
                                    seconds: v.timestamp.timestamp(), 
                                    nanos: v.timestamp.timestamp_subsec_nanos() as i32
                                }), 
                                data: Some(v.value)
                            }))
                        },
                        None => server::api::Node{
                            id: node_id.clone().to_string(),
                            value: None
                        },
                    };
                    let err = self.send_single_data(server::api::stream_response::Data::Node(node)).await;
                    if let Err(err) = err {
                        println!("Connection.listen_to_node: received error - {:?}", err);
                    }
                }
             });
        }
    }

    pub async fn send(&self, responses: Result<StreamResponses, Status>,) -> Result<(), SendError<Result<StreamResponses, Status>>> {
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
        data: server::api::stream_response::Data,
    ) -> Result<(), SendError<Result<StreamResponses, Status>>> {
        self.send(Ok(StreamResponses {
            responses: [StreamResponse { data: Some(data) }].to_vec(),
        }))
        .await
    }

}