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

const PLUGIN_START: &str = "\n  // Plugin Start\n";
const PLUGIN_END: &str = "\n  // Plugin End\n";

pub static BUILT_IN_PLUGINS: Lazy<Vec<ConfigPlugin>> = Lazy::new(|| get_built_in_plugins());

fn get_built_in_plugins() -> Vec<ConfigPlugin> {
  vec![
    ConfigPlugin {
      code: normalize_code(include_str!("../../scripts/js/plugin-dot-case.js")),
      description:
        "Capitalize every word of the file name and replace special characters with a given separator. The default separator is dot."
          .to_string(),
      id: "4eec0c65-8267-4824-a8c0-1851b9858a81".to_string(),
      name: "Dot.Case".to_string(),
      options: vec![ConfigPluginOption {
        default_value: ".".to_string(),
        name: "separator".to_string(),
      }],
    },
    ConfigPlugin {
      code: normalize_code(include_str!("../../scripts/js/plugin-to-lower-case.js")),
      description: "Convert all characters of the file name to lowercase.".to_string(),
      id: "7c857ca3-d26e-45bb-adf7-a1800f3691b1".to_string(),
      name: "To lower case".to_string(),
      options: vec![ConfigPluginOption {
        default_value: "true".to_string(),
        name: "includeName".to_string(),
      },
      ConfigPluginOption {
        default_value: "false".to_string(),
        name: "includeExtension".to_string(),
      }],
    },
    ConfigPlugin {
      code: normalize_code(include_str!("../../scripts/js/plugin-to-upper-case.js")),
      description: "Convert all characters of the file name to lowercase.".to_string(),
      id: "afa82b1a-43de-439e-9f47-b6a666e40511".to_string(),
      name: "To UPPER CASE".to_string(),
      options: vec![ConfigPluginOption {
        default_value: "true".to_string(),
        name: "includeName".to_string(),
      },
      ConfigPluginOption {
        default_value: "false".to_string(),
        name: "includeExtension".to_string(),
      }],
    },
  ]
}

fn normalize_code(code: &str) -> String {
  let start_index = code.find(PLUGIN_START).expect("Couldn't find '// Plugin Start'.") + PLUGIN_START.len();
  let end_index = code.find(PLUGIN_END).expect("Couldn't find '// Plugin End'.");
  if end_index <= start_index {
    panic!("{} is invalid.", code);
  }
  code[(start_index + 1)..end_index]
    .trim()
    .replace("\n  ", "\n")
    .to_string()
}
