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

use anyhow::Result;
use std::collections::HashSet;
use std::fs;
use std::path::Path;

use crate::config;
use crate::plugins;
use crate::protocol;

const is_windows: bool = cfg!(target_os = "windows");

pub async fn get_config() -> Result<config::Config> {
  let mut config = config::get_config();
  let mut built_in_plugin_name_set = plugins::get_built_in_plugin_name_set();
  config.plugins.iter().for_each(|plugin| {
    if built_in_plugin_name_set.contains(&plugin.name) {
      built_in_plugin_name_set.remove(&plugin.name);
    }
  });
  if !built_in_plugin_name_set.is_empty() {
    built_in_plugin_name_set.iter().for_each(|name| {
      config
        .plugins
        .push(plugins::BUILT_IN_PLUGIN_MAP.get(name).unwrap().clone());
    });
    config::set_config(config.clone())?;
  }
  Ok(config)
}

fn recursive_scan_items(
  items: &mut Vec<protocol::Item>,
  path: &Path,
  item_set: &mut HashSet<String>,
  depth: i32,
  include_directory: bool,
  extensions: &HashSet<String>,
) -> Result<()> {
  if path.is_dir() {
    let path_str = path.to_str().unwrap();
    if include_directory && !item_set.contains(path_str) {
      items.push(protocol::Item {
        source_path: path_str.to_string(),
        target_path: path_str.to_string(),
        item_type: protocol::ItemType::Directory,
      });
      item_set.insert(path_str.to_string());
    }
    if depth != 0 {
      for entry in path.read_dir().map_err(anyhow::Error::msg)? {
        let entry = entry.map_err(anyhow::Error::msg)?;
        let path_buf = entry.path();
        let path = path_buf.as_path();
        recursive_scan_items(items, path, item_set, depth, include_directory, extensions)?;
      }
    }
  } else if path.is_file() {
    let path_str = path.to_str().unwrap();
    let extension_included = if extensions.is_empty() {
      true
    } else if let Some(extension) = path.extension() {
      if let Some(extension) = extension.to_str() {
        extensions.contains(extension)
      } else {
        true
      }
    } else {
      true
    };
    if extension_included && !item_set.contains(path_str) {
      items.push(protocol::Item {
        source_path: path_str.to_string(),
        target_path: path_str.to_string(),
        item_type: protocol::ItemType::File,
      });
      item_set.insert(path_str.to_string());
    }
  } else {
    log::warn!("Unknown item: {}", path.to_str().unwrap());
  }
  Ok(())
}

pub async fn rename_items(items: Vec<protocol::Item>) -> Result<usize> {
  let mut count = 0;
  if !items.is_empty() {
    // Step 1: Normalize the paths.
    let items: Vec<protocol::Item> = items
      .into_iter()
      .map(|item| protocol::Item {
        source_path: Path::new(item.source_path.as_str()).to_str().unwrap().to_string(),
        target_path: Path::new(item.target_path.as_str()).to_str().unwrap().to_string(),
        item_type: item.item_type,
      })
      .filter(|item| item.source_path != item.target_path)
      .collect();
    // Step 2: Check duplicated source and target paths.
    let mut source_path_set: HashSet<String> = HashSet::new();
    for item in items.iter() {
      if source_path_set.contains(item.source_path.as_str()) {
        return Err(anyhow::anyhow!("Source path {} is duplicated.", item.source_path));
      }
      source_path_set.insert(item.source_path.clone());
    }
    let mut target_path_set: HashSet<String> = HashSet::new();
    for item in items.iter() {
      if target_path_set.contains(item.target_path.as_str()) {
        return Err(anyhow::anyhow!("Target path {} is duplicated.", item.target_path));
      }
      target_path_set.insert(item.target_path.clone());
    }
    // Step 3: Check if source paths exist, and target paths do not exist.
    for item in items.iter() {
      let source_path = Path::new(item.source_path.as_str());
      if !source_path.exists() {
        return Err(anyhow::anyhow!("Source path {} does not exist.", source_path.display()));
      }
      let target_path = Path::new(item.target_path.as_str());
      if target_path.exists()
        && !source_path_set.contains(item.target_path.as_str())
        && (!is_windows
          || (is_windows
            && source_path.to_str().unwrap().to_lowercase() != target_path.to_str().unwrap().to_lowercase()))
      {
        return Err(anyhow::anyhow!("Target path {} exists.", target_path.display()));
      }
    }
    // Step 4: Resolve the renaming sequence.
    let mut pass_1_items: Vec<protocol::Item> = Vec::new();
    let mut pass_2_items: Vec<protocol::Item> = Vec::new();
    for item in items.iter() {
      // Resolve the conflict.
      if source_path_set.contains(item.target_path.as_str()) {
        if let Some(parent_path) = Path::new(item.target_path.as_str()).parent() {
          let name = uuid::Uuid::new_v4();
          let temp_path = parent_path.join(name.to_string()).to_str().unwrap().to_string();
          pass_1_items.push(protocol::Item {
            source_path: item.source_path.clone(),
            target_path: temp_path.clone(),
            item_type: item.item_type,
          });
          pass_2_items.push(protocol::Item {
            source_path: temp_path.clone(),
            target_path: item.target_path.clone(),
            item_type: item.item_type,
          });
        } else {
          return Err(anyhow::anyhow!("Target path {} cannot be resolved.", item.target_path));
        }
      } else {
        pass_1_items.push(item.clone());
      }
    }
    // Step 5: Rename the items.
    for items in [pass_1_items, pass_2_items].iter() {
      for item in items.iter() {
        let source_path = Path::new(item.source_path.as_str());
        let target_path = Path::new(item.target_path.as_str());
        let target_parent_path = target_path.parent().unwrap();
        if !target_parent_path.exists() {
          fs::create_dir_all(target_parent_path).map_err(anyhow::Error::msg)?;
        }
        fs::rename(source_path, target_path).map_err(anyhow::Error::msg)?;
        count += 1;
      }
    }
  }
  Ok(count)
}

pub async fn scan_items(
  items: Vec<protocol::Item>,
  depth: i32,
  include_directory: bool,
  extensions: Vec<String>,
) -> Result<Vec<protocol::Item>> {
  let mut new_items = if items.is_empty() {
    Vec::new()
  } else {
    let extensions: HashSet<String> = extensions.into_iter().collect();
    let mut item_set = HashSet::<String>::new();
    let mut new_items: Vec<protocol::Item> = Vec::new();
    for item in items.iter() {
      let path = Path::new(item.source_path.as_str());
      if !path.exists() {
        return Err(anyhow::anyhow!("Path {} does not exist.", path.display()));
      }
      recursive_scan_items(
        &mut new_items,
        path,
        &mut item_set,
        depth,
        include_directory,
        &extensions,
      )?
    }
    new_items
  };
  new_items.sort_by(|a, b| a.source_path.cmp(&b.source_path));
  Ok(new_items)
}

pub async fn set_config(config: config::Config) -> Result<config::Config> {
  config::set_config(config)?;
  Ok(config::get_config())
}
