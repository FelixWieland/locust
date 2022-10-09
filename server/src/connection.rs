

use std::sync::Arc;

use dashmap::DashMap;
use tonic::Status;
use uuid::Uuid;
use tokio::sync::{mpsc::{Sender, Receiver, error::SendError, self}, Mutex};

use crate::{server::{api::{
    StreamResponses, StreamResponse,
    Heartbeat, StreamRequests
}, self}, heartbeat, state::GlobalState};


#[derive(Debug)]
pub struct Connection {
    global_state: Arc<GlobalState>,

    id: Uuid,

    last_heartbeat: Arc<Mutex<Heartbeat>>,
    latency_ms: Arc<Mutex<Option<i64>>>, 

    sender: Sender<Result<StreamResponses, Status>>,
    receiver: DashMap<Uuid, Sender<StreamRequests>> // ! THIS IS CORRECT
}

impl Connection {
    pub fn new(global_state: Arc<GlobalState>, sender: Sender<Result<StreamResponses, Status>>) -> Connection {
        Connection{
            global_state,

            id: Uuid::new_v4(),

            last_heartbeat: Arc::new(Mutex::new(Heartbeat {
                timestamp: Some(heartbeat::current_timestamp())
            })),
            latency_ms: Arc::new(Mutex::new(None)),

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
        let latency_ms = heartbeat::calculate_latency_ms(&client_beat.timestamp.clone().unwrap(), &server_beat);
        
        println!("Connection.Heartbeat: received client : {:?}, send response: {:?}, latency: {:?}ms", client_beat.timestamp.unwrap().seconds, server_beat.seconds, latency_ms);
        
        let mut t = self.last_heartbeat.lock().await;
        let mut l = self.latency_ms.lock().await;

        *t = Heartbeat { timestamp: Some(server_beat.clone()) };
        *l = Some(latency_ms);

        self.send_single_data(server::api::stream_response::Data::Heartbeat(Heartbeat { timestamp: Some(server_beat) })).await.expect("error sending heartbeat")
    }

    pub async fn send(&self, responses: Result<StreamResponses, Status>) -> Result<(), SendError<Result<StreamResponses, Status>>> {
        self.sender.send(responses).await
    }

    pub async fn send_single_data(&self, data: server::api::stream_response::Data) -> Result<(), SendError<Result<StreamResponses, Status>>> {
        self.send(Ok(StreamResponses { responses: [
            StreamResponse {
                data: Some(data)
            }
        ].to_vec() })).await
    }

    pub fn listen(&self) -> Receiver<StreamRequests> {
        let (sender, receiver) = mpsc::channel::<StreamRequests>(128);
        self.receiver.insert(Uuid::new_v4(), sender);
        receiver
    }
}