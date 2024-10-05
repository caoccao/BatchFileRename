/*
* Copyright (c) 2024. caoccao.com Sam Cao
* All rights reserved.

* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at

* http://www.apache.org/licenses/LICENSE-2.0

* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

use tauri::Manager;

mod config;
mod controller;
mod plugins;
mod protocol;

fn convert_error(error: anyhow::Error) -> String {
  error.to_string()
}

#[tauri::command]
async fn get_built_in_plugins() -> Result<Vec<config::ConfigPlugin>, String> {
  log::debug!("get_built_in_plugins");
  controller::get_built_in_plugins().await.map_err(convert_error)
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  env_logger::init();
  tauri::Builder::default()
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_clipboard_manager::init())
    .plugin(tauri_plugin_cli::init())
    .setup(|app| {
      let window = app.get_webview_window("main").unwrap();
      let _ = window.set_title("Batch File Rename v0.2.0");
      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
      get_built_in_plugins,
      get_config,
      rename_items,
      scan_items,
      set_config
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
