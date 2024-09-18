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
use std::fs;
use std::path::Path;

use crate::protocol;

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

pub async fn scan_items(items: Vec<protocol::Item>) -> Result<Vec<protocol::Item>> {
  let mut new_items = if items.is_empty() {
    Vec::new()
  } else {
    let mut new_items: Vec<protocol::Item> = Vec::new();
    for mut item in items {
      let path = Path::new(item.source_path.as_str());
      if !path.exists() {
        return Err(anyhow::anyhow!("Path {} does not exist.", path.display()));
      }
      if path.is_dir() {
        item.item_type = protocol::ItemType::Directory;
      } else if path.is_file() {
        item.item_type = protocol::ItemType::File;
      }
      new_items.push(item);
    }
    new_items
  };
  new_items.sort_by(|a, b| a.source_path.cmp(&b.source_path));
  Ok(new_items)
}
