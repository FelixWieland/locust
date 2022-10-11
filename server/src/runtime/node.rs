use dashmap::DashMap;
use uuid::Uuid;
use std::{sync::Arc};
use tokio::sync::{Mutex, mpsc, mpsc::Sender, mpsc::Receiver};
use chrono::{DateTime, Utc};

/**
 * NotifyChangeOptions are responsible to control when the node 
 * should notify/stream its value to the nodes who depend on it
 */
#[derive(Debug)]
pub enum NotifyChangeOptions {
    None,
    Timestamp,
    Value,
    TimestampValue
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
#[derive(Debug)]
pub struct Node<T> {
    id: Uuid,
    value: Arc<Mutex<Option<Value<T>>>>,
    
    notify_change_option: NotifyChangeOptions,
    // a node can depend on multiple other nodes

    // dependencies: Vec<Arc<Mutex<<Self>>>,
    subscribers: DashMap<Uuid, Sender<Option<Value<T>>>>
}

impl<T> Node<T> where T: Clone + std::cmp::PartialEq + std::fmt::Debug {
    pub fn new(value: Option<T>) -> Node<T> {
        Node {
            id: Uuid::new_v4(),
            value: Arc::new(Mutex::new(None)),

            notify_change_option: NotifyChangeOptions::Value,

            subscribers: DashMap::new()
        }
    }

    pub fn id(&self) -> uuid::Uuid {
        self.id
    } 

    /**
     * value returns a copy of the value that is currently stored in the node
     */
    pub async fn value(&self) -> Option<Value<T>> {
        let v = self.value.lock().await;
        v.clone()
    }

    /**
     * Todo: This needs to be insanly fast ...
     */
    pub async fn update_value(&self, new_value: Option<Value<T>>) {
        let mut v = self.value.lock().await;

        let mut time_changed = true;
        let mut value_changed = true;
        if let Some(new_value) = new_value.clone() {
            if let Some(sv) = v.as_ref() {
                value_changed = sv.value == new_value.value;
                time_changed = sv.timestamp == new_value.timestamp;
            }
        }
        *v = new_value.clone();

        for listener in self.subscribers.iter() {
            if let Err(err) = listener.value().clone().send(new_value.clone()).await {
                println!("Node.update_value: Error while sending to subscribers - {:?}", err)
            }
        }
    }

    /**
     * 
     */
    pub async fn subscribe(&self, receiver_id: &Uuid) -> Receiver<Option<Value<T>>> {
        let (sender, receiver) = mpsc::channel::<Option<Value<T>>>(128);
        self.subscribers.insert(receiver_id.clone(), sender.clone());

        // TODO: refactor this
        let v = self.value.lock().await;
        let _ = sender.send(v.clone()).await;

        receiver
    }

    pub async fn unsubscribe(&self, receiver_id: &Uuid) {
        self.subscribers.remove(receiver_id);
    }

}

/**
 * A value exists at a given timestamp
 */
#[derive(Clone, Debug)]
pub struct Value<T> {
    pub value: T,
    pub timestamp: DateTime<Utc>
}

impl<T> Value<T> {
    fn new(value: T) -> Value<T> {
        Value {
            value,
            timestamp: Utc::now()
        }
    }
}
