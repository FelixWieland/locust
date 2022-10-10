use api::StreamResponses;
use dashmap::DashMap;
use prost_types::Any;
use tokio::sync::mpsc::Receiver;
use std::sync::Arc;
use tokio::{self, sync::mpsc::Sender};
use tonic::Status;
use uuid::Uuid;

use crate::connection::Connection;
use crate::runtime::node::{Node, Value};
use crate::runtime::runtime::Runtime;
use crate::session::Session;
use crate::server::api::{self};

#[derive(Debug)]
pub struct GlobalState {
    connections: DashMap<Uuid, Arc<Connection>>,
    sessions: DashMap<Uuid, Arc<Session>>,

    runtime: Runtime<Any>,
}

impl GlobalState {
    pub fn new() -> GlobalState {
        GlobalState {
            connections: DashMap::new(),
            sessions: DashMap::new(),
            runtime: Runtime::new()
        }
    }

    pub fn add_connection(
        self: Arc<Self>,
        sender: Sender<Result<StreamResponses, Status>>,
    ) -> Arc<Connection> {
        let conn = Arc::new(Connection::new(self.clone(), sender));
        self.connections.insert(conn.id(), conn.clone());
        conn
    }

    pub fn remove_connection(&self, id: &Uuid) {
        // check if its needed to remove it from the user to
        self.connections.remove(id);
    }

    pub fn get_connection_by_id(&self, connection_id: Uuid) -> Option<Arc<Connection>> {
        match self.connections.get(&connection_id) {
            Some(v) => Some(v.value().clone()),
            None => None,
        }
    }

    pub fn add_session(
        self: Arc<Self>,
        session: Session
    ) -> Arc<Session> {
        let s = Arc::new(session);
        self.sessions.insert(s.id(), s.clone());
        s
    }

    pub fn remove_session(&self, id: Uuid) {
        // check if its needed to remove it from the user to
        self.sessions.remove(&id);
    }

    pub fn get_session_by_id(&self, session_id: Uuid) -> Option<Arc<Session>> {
        match self.sessions.get(&session_id) {
            Some(v) => Some(v.value().clone()),
            None => None,
        }
    }

    pub fn create_node(&self, value: Option<Any>) -> Arc<Node<Any>> {
        self.runtime.add_node(Node::new(value))
    }

    pub async fn update_node_value(&self, node_id: &Uuid, new_value: Option<Value<Any>>) -> Option<Arc<Node<Any>>> {
        self.runtime.update_node_value(node_id, new_value).await
    }

    pub async fn listen_to_node(&self, receiver_id: &Uuid, node_id: &Uuid) -> Option<Receiver<Option<Value<Any>>>> {
        let n = self.runtime.get_node(node_id);
        if let Some(n) = n {
            Some(n.listen(receiver_id).await)
        } else {
            None
        }
    }

    pub async fn disconnect_from_node(&self, receiver_id: &Uuid, node_id: &Uuid) {
        let n = self.runtime.get_node(node_id);
        if let Some(n) = n {
            n.disconnect(receiver_id).await
        }
    }

}