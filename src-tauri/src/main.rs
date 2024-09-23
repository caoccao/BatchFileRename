// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod config;
mod controller;
mod plugins;
mod protocol;

fn convert_error(error: anyhow::Error) -> String {
  error.to_string()
}

#[tauri::command]
async fn get_config() -> Result<config::Config, String> {
  log::debug!("get_config");
  controller::get_config().await.map_err(convert_error)
}

#[tauri::command]
async fn rename_items(items: Vec<protocol::Item>) -> Result<usize, String> {
  log::debug!("rename_items: {:?}", items);
  controller::rename_items(items).await.map_err(convert_error)
}

#[tauri::command]
async fn scan_items(
  items: Vec<protocol::Item>,
  depth: i32,
  include_directory: bool,
  extensions: Vec<String>,
) -> Result<Vec<protocol::Item>, String> {
  log::debug!(
    "scan_items: {:?}, depth: {}, include_directory: {}, extensions: {:?}",
    items,
    depth,
    include_directory,
    extensions
  );
  controller::scan_items(items, depth, include_directory, extensions)
    .await
    .map_err(convert_error)
}

#[tauri::command]
async fn set_config(config: config::Config) -> Result<config::Config, String> {
  log::debug!("set_config({:?})", config);
  controller::set_config(config).await.map_err(convert_error)
}

fn main() {
  env_logger::init();
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
      get_config,
      rename_items,
      scan_items,
      set_config
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
