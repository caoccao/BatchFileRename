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

use anyhow::{Error, Result};
use once_cell::sync::Lazy;
use serde::{Deserialize, Serialize};
use std::fs::File;
use std::io::{BufReader, BufWriter};
use std::path::PathBuf;

use crate::plugins;

static mut CONFIG: Lazy<Config> = Lazy::new(|| Config::new());

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct Config {
  pub depth: i32,
  pub extensions: Vec<String>,
  #[serde(rename = "filterByExtensions")]
  pub filter_by_extensions: bool,
  #[serde(rename = "includeDirectories")]
  pub include_directories: bool,
  pub plugins: Vec<ConfigPlugin>,
}

impl Default for Config {
  fn default() -> Self {
    Self {
      depth: -1,
      extensions: "mp3,mp4,avi,flv,mkv,ogg,webm,wmv,ape,mp3,aac,flac,mka,m4a"
        .to_string()
        .split(',')
        .map(|s| s.trim().to_string())
        .collect(),
      filter_by_extensions: true,
      include_directories: false,
      plugins: plugins::BUILT_IN_PLUGINS.to_vec(),
    }
  }
}

impl Config {
  fn new() -> Self {
    let config_path_buf = Self::get_path_buf();
    if config_path_buf.exists() {
      Self::load(config_path_buf)
    } else {
      log::debug!("Loading default config.");
      let config = Self::default();
      if let Err(err) = config.save(config_path_buf) {
        log::error!("Couldn't save the default config because {}", err);
      }
      config
    }
  }

  fn get_path_buf() -> PathBuf {
    let mut config_path_buf = std::env::current_exe().unwrap().parent().unwrap().to_path_buf();
    config_path_buf.push("batch-file-rename.json");
    config_path_buf
  }

  fn load(path: PathBuf) -> Self {
    let cloned_path = path.clone();
    let path_string = cloned_path.to_str().unwrap();
    log::debug!("Loading config from {}.", path_string);
    let file = File::open(path).expect(format!("Couldn't open config file {}.", path_string).as_str());
    let buf_reader = BufReader::new(file);
    match serde_json::from_reader(buf_reader) {
      Ok(config) => config,
      Err(err) => {
        log::error!("Couldn't load the config because {}", err);
        let config = Self::default();
        if let Err(err) = config.save(cloned_path) {
          log::error!("Couldn't save the default config because {}", err);
        }
        config
      }
    }
  }

  fn save(&self, path: PathBuf) -> Result<()> {
    let cloned_path = path.clone();
    let path_string = cloned_path.to_str().unwrap();
    log::debug!("Saving config to {}.", path_string);
    let file = File::create(path).expect(format!("Couldn't create config file {}.", path_string).as_str());
    let buf_writer = BufWriter::new(file);
    serde_json::to_writer_pretty(buf_writer, &self).map_err(Error::msg)
  }
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct ConfigPlugin {
  pub code: String,
  pub description: String,
  pub id: String,
  pub name: String,
  pub options: Vec<ConfigPluginOption>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct ConfigPluginOption {
  #[serde(rename = "defaultValue")]
  pub default_value: String,
  pub name: String,
}

pub fn get_config() -> Config {
  unsafe { CONFIG.clone() }
}

pub fn set_config(config: Config) -> Result<()> {
  let config_path_buf = Config::get_path_buf();
  let result = config.save(config_path_buf);
  unsafe { CONFIG.clone_from(&config) };
  result
}
