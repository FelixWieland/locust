// generated by `sqlx migrate build-script`
fn main() -> Result<(), Box<dyn std::error::Error>> {
    tonic_build::configure()
        .build_server(true).compile(&["messages.proto", "api.proto"], &["../protos"])?;
    Ok(())
}

