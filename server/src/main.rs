use siot_core::{server::APIService, state::GlobalState};
use siot_core::api::api_server::ApiServer;
use tonic::transport::Server;
use std::{sync::Arc};


#[tokio::main]
async fn main() -> Result<(), sqlx::Error> {
    let address = "0.0.0.0:8080".parse().unwrap();
    let api_service = APIService::new(Arc::new(GlobalState::new()));
  
    Server::builder().accept_http1(true).add_service(tonic_web::enable(ApiServer::new(api_service)))
      .serve(address)
      .await.unwrap();
    Ok(())
}
