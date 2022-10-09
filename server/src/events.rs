use std::sync::Arc;

use futures::future::join_all;
use tonic::Status;
use futures; 

use crate::{connection::Connection, server::api, server::api::StreamRequests};
use crate::events::api::{ Heartbeat };

pub struct DataHandler {}
pub struct ErrorHandler {}

impl DataHandler {
    pub async fn requests(conn: Arc<Connection>, r: StreamRequests) {
        let mut promises = vec![];
        for request in r.requests {
            match request.data {
                Some(data) => {
                    let c = conn.clone();
                    promises.push(match data {
                        api::stream_request::Data::Heartbeat(v) => DataHandler::on_heartbeat(c, v),
                        api::stream_request::Data::None(_) => todo!(),
                    })
                },
                None => todo!(),
            };
        }
        join_all(promises).await;
    }

    async fn on_heartbeat(conn: Arc<Connection>, data: Heartbeat) {
        conn.beat_once(data).await;
    }

}

impl ErrorHandler {
    pub fn error(conn: Arc<Connection>, s: Status) {
        println!("{:?}", s);
    }
}
