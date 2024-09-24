/*
 *   Copyright (c) 2024. caoccao.com Sam Cao
 *   All rights reserved.

 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at

 *   http://www.apache.org/licenses/LICENSE-2.0

 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

export function assert(condition, message) {
  if (condition) {
    console.info(`✅ ${message} passed.`);
  } else {
    console.error(`❌ ${message} failed.`);
  }
}

export function assertPlugin(plugin, path, expectedPath, options) {
  const targetItems = path ? [{ targetPath: path }] : [];
  const args = {
    $sourceItems: [],
    $targetItems: path ? [{ targetPath: path }] : [],
    $options: options,
  };
  const message = JSON.stringify(args.$targetItems);
  plugin(args);
  if (expectedPath) {
    assert(args.$targetItems[0].targetPath === expectedPath, message);
  } else {
    assert(args.$targetItems.length == 0, message);
  }
}
