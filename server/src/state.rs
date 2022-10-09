use api::StreamResponses;
use dashmap::DashMap;
use std::sync::Arc;
use tokio::{self, sync::mpsc::Sender};
use tonic::Status;
use uuid::Uuid;

use crate::connection::Connection;
use crate::server::api;

#[derive(Debug)]
pub struct GlobalState {
    connections: DashMap<Uuid, Arc<Connection>>,
}

impl GlobalState {
    pub fn new() -> GlobalState {
        GlobalState {
            connections: DashMap::new(),
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

    pub fn remove_connection(&self, id: Uuid) {
        // check if its needed to remove it from the user to
        self.connections.remove(&id);
    }

    pub fn get_connection_by_id(&self, connection_id: Uuid) -> Option<Arc<Connection>> {
        match self.connections.get(&connection_id) {
            Some(v) => Some(v.value().clone()),
            None => None,
        }
    }
}