// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod controller;
mod protocol;

fn convert_error(error: anyhow::Error) -> String {
  error.to_string()
}

#[tauri::command]
async fn scan_items(items: Vec<protocol::Item>) -> Result<Vec<protocol::Item>, String> {
  log::debug!("scan_items: {:?}", items);
  controller::scan_items(items).await.map_err(convert_error)
}

fn main() {
  env_logger::init();
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![scan_items])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
