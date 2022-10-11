use chrono::TimeZone;
use prost_types::Timestamp;

pub fn current_timestamp() -> Timestamp {
    let t = chrono::Utc::now();
    Timestamp {
        seconds: t.timestamp(),
        nanos: t.timestamp_subsec_nanos() as i32,
    }
}

pub fn calculate_latency_ms(client: &Timestamp, server: &Timestamp) -> i64 {
    let c = chrono::Utc.timestamp(client.seconds, client.nanos as u32);
    let s = chrono::Utc.timestamp(server.seconds, server.nanos as u32);
    return s.timestamp_millis() - c.timestamp_millis();
}
