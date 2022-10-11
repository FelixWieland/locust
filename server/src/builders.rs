use chrono::DateTime;
use chrono::Utc;
use prost_types::Any;
use prost_types::Timestamp;
use uuid::Uuid;

use crate::api;
use crate::api::stream_response as res;
use crate::connection::Connection;
// use crate::api::stream_request as req;
use crate::runtime::node;
use crate::session::Session;

pub struct Response {}

impl Response {
    pub fn stream_responses(responses: Vec<api::StreamResponse>) -> api::StreamResponses {
        api::StreamResponses { responses }
    }

    pub fn stream_response(data: res::Data) -> api::StreamResponse {
        api::StreamResponse { data: Some(data) }
    }

    pub fn connection_stream(conn: &Connection) -> api::StreamResponse {
        Response::stream_response(res::Data::Connection(api::Connection {
            id: conn.id().to_string(),
            subscribed_nodes_i_ds: conn.subscribed_node_ids().iter().map(|node_id| node_id.to_string()).collect()
        }))
    }

    pub fn node_stream(node_id: &Uuid, data: Option<node::Value<Any>>) -> api::StreamResponse {
        Response::stream_response(res::Data::Node(api::Node {
            id: node_id.to_string(),
            value: match data {
                Some(data) => Some(api::node::Value::Some(api::NodeValue {
                    timestamp: Some(Response::timestamp(data.timestamp)),
                    data: Some(data.value),
                })),
                None => None,
            },
        }))
    }

    pub fn heartbeat_stream(time: Timestamp) -> api::StreamResponse {
        Response::stream_response(res::Data::Heartbeat(api::Heartbeat {
            timestamp: Some(time),
        }))
    }

    pub fn session_stream(session: &Session) -> api::StreamResponse {
        Response::stream_response(res::Data::Session(api::Session {
            session_token: session.id().to_string(),
            active_connections: session.active_connections() as u32,
            subscribed_nodes_i_ds: session.subscribed_node_ids().iter().map(|node_id| node_id.to_string()).collect()
        }))
    }

    pub fn timestamp(time: DateTime<Utc>) -> Timestamp {
        Timestamp {
            seconds: time.timestamp(),
            nanos: time.timestamp_subsec_nanos() as i32,
        }
    }
}
