use uuid::Uuid;
use std::sync::Arc;
use tokio::sync::{Mutex};
use chrono::{DateTime, Utc};
use async_trait::async_trait;

/**
 * NotifyChangeOptions are responsible to control when the node 
 * should notify/stream its value to the nodes who depend on it
 */
pub enum NotifyChangeOptions {
    None,
    Timestamp,
    Value,
    TimestampValue
}

/**
 * StorageOptions are responsible to control if the node should store its values
 * the storage rules get applied after the NotifyChange rules.
 * That means the value only gets stored anyway if it notifies its listeners
 */
pub enum StorageOptions {
    None,
    Current,
    All
}

/**
 * The trait that must be implemented for the node storage
 */
#[async_trait]
pub trait NodeStorage<T> {
    async fn store(self, node_id: Uuid, value: Value<Option<T>>) -> Result<(), ()>;
    async fn read_current_at_point_in_time(self, node_id: Uuid, point_in_time: DateTime<Utc>) -> Result<Value<Option<T>>, ()>;
    // TODO add multi storage read api
}

/**
 * The trait that must be implemented to add logic for a node
 */
#[async_trait]
pub trait NodeLogic<T> {
    async fn compute(self, dependencies: Vec<Node<T>>) -> Result<Value<Option<T>>, ()>;
}



/**
 * A node represents a combination of the following:
 * - Sensor
 * - Actor
 * 
 * - Storage
 * - Logic
 * 
 * The Storage and Logic implementations can change depending on the need
 * 
 * Basically its a variable with reactive capabilities. 
 */
pub struct Node<T> {
    id: Uuid,
    value: Arc<Mutex<Value<Option<T>>>>,
    
    notify_change_option: NotifyChangeOptions,
    storage_option: StorageOptions,

    storage_engine: Option<Box<Arc<dyn NodeStorage<T>>>>,
    logic_engine: Option<Box<Arc<dyn NodeLogic<T>>>>
    // a node can depend on multiple other nodes
    // dependencies: Vec<Arc<Mutex<<Self>>>,
}

impl<T> Node<T> where T: Clone {
    fn new(value: Option<T>) -> Node<T> {
        Node {
            id: Uuid::new_v4(),
            value: Arc::new(Mutex::new(Value::new(value))),

            notify_change_option: NotifyChangeOptions::Value,
            storage_option: StorageOptions::Current,

            storage_engine: None,
            logic_engine: None,
        }
    }

    /**
     * value returns a copy of the value that is currently stored in the node
     */
    async fn value(self) -> Value<Option<T>> {
        let v = self.value.lock().await;
        Value {
            value: v.value.clone(),
            timestamp: v.timestamp
        }
    }

}

/**
 * A value exists at a given timestamp
 */
pub struct Value<T> {
    value: T,
    timestamp: DateTime<Utc>
}

impl<T> Value<T> {
    fn new(value: T) -> Value<T> {
        Value {
            value,
            timestamp: Utc::now()
        }
    }
}
