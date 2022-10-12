use std::sync::Arc;
use futures::channel::mpsc::Receiver;
use super::node::{Node, Value};

/**
 * Because a Node can only subscribe another node we can directly implement the reference holder
 */
#[derive(Debug)]
pub struct NodeReceiver<T> {
    pub node: Arc<Node<T>>,
    pub receiver: Receiver<Option<Value<T>>>
}