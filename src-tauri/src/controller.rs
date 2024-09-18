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

use crate::protocol;

fn recursive_scan_items(
  items: &mut Vec<protocol::Item>,
  path: &Path,
  depth: i32,
  include_directory: bool,
  extensions: &HashSet<String>,
) -> Result<()> {
  if path.is_dir() {
    if include_directory {
      items.push(protocol::Item {
        source_path: path.to_str().unwrap().to_string(),
        target_path: path.to_str().unwrap().to_string(),
        item_type: protocol::ItemType::Directory,
      });
    }
    if depth != 0 {
      for entry in path.read_dir().map_err(anyhow::Error::msg)? {
        let entry = entry.map_err(anyhow::Error::msg)?;
        let path_buf = entry.path();
        let path = path_buf.as_path();
        recursive_scan_items(items, path, depth, include_directory, extensions)?;
      }
    }
  } else if path.is_file() {
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
    if extension_included {
      items.push(protocol::Item {
        source_path: path.to_str().unwrap().to_string(),
        target_path: path.to_str().unwrap().to_string(),
        item_type: protocol::ItemType::File,
      });
    }
  } else {
    log::warn!("Unknown item: {}", path.to_str().unwrap());
  }
  Ok(())
}

pub async fn rename_items(items: Vec<protocol::Item>) -> Result<usize> {
  let mut count = 0;
  if !items.is_empty() {
    // First pass: Check if source paths exist, and target paths do not exist.
    for item in items.iter() {
      let source_path = Path::new(item.source_path.as_str());
      if !source_path.exists() {
        return Err(anyhow::anyhow!("Source path {} does not exist.", source_path.display()));
      }
      let target_path = Path::new(item.target_path.as_str());
      if target_path.exists() {
        return Err(anyhow::anyhow!("Target path {} exists.", target_path.display()));
      }
    }
    // Second pass: Rename the items.
    for item in items.iter() {
      let source_path = Path::new(item.source_path.as_str());
      let target_path = Path::new(item.target_path.as_str());
      fs::rename(source_path, target_path).map_err(anyhow::Error::msg)?;
      count += 1;
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
    let mut new_items: Vec<protocol::Item> = Vec::new();
    for item in items.iter() {
      let path = Path::new(item.source_path.as_str());
      if !path.exists() {
        return Err(anyhow::anyhow!("Path {} does not exist.", path.display()));
      }
      recursive_scan_items(&mut new_items, path, depth, include_directory, &extensions)?
    }
    new_items
  };
  new_items.sort_by(|a, b| a.source_path.cmp(&b.source_path));
  Ok(new_items)
}
