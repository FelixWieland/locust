use std::sync::Arc;

use async_trait::async_trait;
use tokio::sync::mpsc::error::SendError;
use tonic::Status;

use crate::api::{StreamResponses, StreamResponse};

#[async_trait]
pub trait NodeSubscriber {
    async fn subscribe_to_node(self: Arc<Self>, node_id: uuid::Uuid);
    async fn unsubscribe_from_node(self: Arc<Self>, node_id: uuid::Uuid);
}

#[async_trait]
pub trait Sender {
    async fn send_multi(&self, responses: StreamResponses) -> Result<(), SendError<Result<StreamResponses, Status>>>;
    async fn send_single(&self, response: StreamResponse) -> Result<(), SendError<Result<StreamResponses, Status>>>;
}

#[async_trait]
pub trait SelfAware {
    async fn publish_self(&self);
}