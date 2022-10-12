use std::sync::Arc;

use dashmap::DashMap;
use uuid::Uuid;

use super::node::{Node, Value};

/**
 * Runtime holds a network from nodes
 * it can walk through the nodes and creates a node schema. Based on that schema it can reinitialize all the nodes
 */
#[derive(Debug)]
pub struct Runtime<T> {
    nodes: DashMap<Uuid, Arc<Node<T>>>,
}

impl<T> Runtime<T>
where
    T: Clone + std::cmp::PartialEq + std::fmt::Debug,
{
    pub fn new() -> Runtime<T> {
        Runtime {
            nodes: DashMap::new(),
        }
    }

    pub fn add_node(&self, node: Node<T>) -> Arc<Node<T>> {
        let n = Arc::new(node);
        self.nodes.insert(n.id(), n.clone());
        n
    }

    pub fn get_node(&self, node_id: &Uuid) -> Option<Arc<Node<T>>> {
        match self.nodes.get(node_id) {
            Some(v) => Some(v.value().clone()),
            None => None,
        }
    }

    pub async fn update_node_value(
        &self,
        node_id: &Uuid,
        new_value: Option<Value<T>>,
    ) -> Option<Arc<Node<T>>> {
        match self.get_node(node_id) {
            Some(node) => {
                node.update_value(new_value).await;
                Some(node)
            }
            None => None,
        }
    }
}
