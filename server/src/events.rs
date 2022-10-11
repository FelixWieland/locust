use futures::future::join_all;
use futures::{self, FutureExt};
use std::sync::Arc;
use tonic::Status;

use crate::api::{AquireSession, CreateNode, UpdateNodeValue};
use crate::events::api::Heartbeat;
use crate::{api, api::StreamRequests, connection::Connection};

pub struct DataHandler {}
pub struct ErrorHandler {}

impl DataHandler {
    pub async fn requests(conn: Arc<Connection>, r: StreamRequests) {
        let mut promises = vec![];
        for request in r.requests {
            match request.data {
                Some(data) => promises.push(match data {
                    api::stream_request::Data::Heartbeat(v) => {
                        DataHandler::on_heartbeat(conn.clone(), v).boxed_local()
                    }
                    api::stream_request::Data::AquireSession(a) => {
                        DataHandler::on_aquire_session(conn.clone(), a).boxed_local()
                    }
                    api::stream_request::Data::CreateNode(n) => {
                        DataHandler::on_create_node(conn.clone(), n).boxed_local()
                    }
                    api::stream_request::Data::UpdateNodeValue(nv) => {
                        DataHandler::on_update_node_value(conn.clone(), nv).boxed_local()
                    }
                    api::stream_request::Data::None(_) => todo!(),
                }),
                None => todo!(),
            };
        }
        join_all(promises).await;
    }

    async fn on_heartbeat(conn: Arc<Connection>, data: Heartbeat) {
        conn.beat_once(data).await
    }

    async fn on_aquire_session(conn: Arc<Connection>, data: AquireSession) {
        conn.aquire_session(data).await
    }

    async fn on_create_node(conn: Arc<Connection>, data: CreateNode) {
        conn.create_node(data).await;
    }

    async fn on_update_node_value(conn: Arc<Connection>, data: UpdateNodeValue) {
        conn.update_node_value(data).await;
    }
}

impl ErrorHandler {
    pub fn error(conn: Arc<Connection>, s: Status) {
        println!("{:?}", s);
    }
}
