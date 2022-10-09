use api::{api_server::Api, StreamRequests, StreamResponses};
use std::{pin::Pin, str::FromStr, sync::Arc};
use tokio::sync::mpsc;
use tokio_stream::{wrappers::ReceiverStream, StreamExt};
use tonic::{codegen::futures_core::Stream, Request, Response, Status, Streaming};
use uuid::Uuid;

use crate::{events, state::GlobalState};

use self::api::{None, UnaryStreamRequest};

pub mod api {
    tonic::include_proto!("api");
}

#[derive(Debug)]
pub struct APIService {
    state: Arc<GlobalState>,
}

type ResponseStream = Pin<Box<dyn Stream<Item = Result<StreamResponses, Status>> + Send>>;

impl APIService {
    pub fn new(state: Arc<GlobalState>) -> APIService {
        APIService { state }
    }
}

#[tonic::async_trait]
impl Api for APIService {
    type StreamStream = ResponseStream;
    async fn stream(
        &self,
        req: tonic::Request<StreamRequests>,
    ) -> Result<Response<Self::StreamStream>, Status> {
        //let mut in_stream = req.into_inner();
        let (tx, rx) = mpsc::channel(128);
        let conn = self.state.clone().add_connection(tx);
        // let state = self.state.clone();


        tokio::spawn(async move {
            let _ = conn.send_single_data(api::stream_response::Data::ConnectionId(api::ConnectionId{
                id: conn.id().to_string()
            })).await;
            // while let Some(result) = in_stream.next().await {
            //     match result {
            //         Ok(v) => events::DataHandler::requests(conn.clone(), v).await,
            //         Err(err) => events::ErrorHandler::error(conn.clone(), err)
            //     }
            // }
            // // connection ended -> remove it
            // state.remove_connection(conn.id());
        });

        let out_stream = ReceiverStream::new(rx);

        Ok(Response::new(Box::pin(out_stream) as Self::StreamStream))
    }

    async fn stream_request(
        &self,
        request: Request<UnaryStreamRequest>,
    ) -> Result<Response<None>, Status> {
        let inreq = request.into_inner();
        let connection_id = inreq.connection_id.unwrap().id;

        match Uuid::from_str(&connection_id) {
            Ok(cid) => match self.state.get_connection_by_id(cid) {
                Some(conn) => {
                    let reply = api::None {};
                    events::DataHandler::requests(conn.clone(), api::StreamRequests { requests: inreq.requests }).await;
                    Ok(Response::new(reply))
                }
                None => Err(Status::not_found("Connection not found")),
            },
            Err(_) => Err(Status::invalid_argument("Given connection id is not valid")),
        }
    }
}
