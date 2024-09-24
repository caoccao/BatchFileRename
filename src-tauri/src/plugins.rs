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

use once_cell::sync::Lazy;
use std::include_str;

use crate::config::{ConfigPlugin, ConfigPluginOption};

pub static BUILT_IN_PLUGINS: Lazy<Vec<ConfigPlugin>> = Lazy::new(|| get_built_in_plugins());

fn get_built_in_plugins() -> Vec<ConfigPlugin> {
  vec![ConfigPlugin {
    code: normalize_code(include_str!("../../scripts/js/plugin-dotify.js")),
    description: "Replace special characters with a given separator. The default separator is '.'.".to_string(),
    name: "Dotify".to_string(),
    options: vec![ConfigPluginOption {
      default_value: ".".to_string(),
      name: "separator".to_string(),
    }],
  }]
}

fn normalize_code(code: &str) -> String {
  let start_index = code
    .find("\n  // Plugin Start\n")
    .expect("Couldn't find '// Plugin Start'.");
  let end_index = code
    .find("\n  // Plugin End\n")
    .expect("Couldn't find '// Plugin End'.");
  if end_index <= start_index {
    panic!("{} is invalid.", code);
  }
  code[(start_index + 1)..end_index]
    .trim()
    .replace("\n  ", "\n")
    .to_string()
}
