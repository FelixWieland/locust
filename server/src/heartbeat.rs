use std::sync::Arc;

use chrono::TimeZone;
use chrono::Utc;
use chrono::DateTime;
use chrono::Duration;
use prost_types::Timestamp;
use tokio::sync::Mutex;

#[derive(Debug)]
pub struct Heartbeat {
    dies_after: Duration,
    last_heartbeat: Arc<Mutex<DateTime<Utc>>>,
    latency_ms: Arc<Mutex<Option<i64>>>,
}

impl Heartbeat {
    pub fn new(dies_after: Duration) -> Heartbeat {
        Heartbeat { 
            dies_after: dies_after,
            last_heartbeat: Arc::new(Mutex::new(Utc::now())), 
            latency_ms: Arc::new(Mutex::new(None)) 
        }
    }

    pub async fn beat_once(&self, started_at: DateTime<Utc>) {
        let server_beat = Utc::now();
        let latency_ms = server_beat.timestamp_millis() - started_at.timestamp_millis();
        
        let mut t = self.last_heartbeat.lock().await;
        let mut l = self.latency_ms.lock().await;

        *t = server_beat;
        *l = Some(latency_ms);
    }

    pub async fn heart_is_beating(&self) -> bool {
        let now = Utc::now();
        let previous_beat = self.last_heartbeat.lock().await;
        let dur_since = *previous_beat - now;
        dur_since < self.dies_after
    }

    pub async fn last_heartbeat(&self) -> DateTime<Utc> {
        let last_heartbeat = self.last_heartbeat.lock().await;
        let l = *last_heartbeat;
        l.clone()
    }

    pub async fn latency_ms(&self) -> Option<i64> {
        self.latency_ms.lock().await.clone()
    }
}

pub fn utc_as_proto_timestamp(t: DateTime<Utc>) -> Timestamp {
    Timestamp {
        seconds: t.timestamp(),
        nanos: t.timestamp_subsec_nanos() as i32,
    }
}

pub fn proto_timestamp_as_utc(t: Timestamp) -> DateTime<Utc> {
    Utc.timestamp(t.seconds, t.nanos as u32)
}

pub fn current_timestamp() -> Timestamp {
    utc_as_proto_timestamp(Utc::now())
}
