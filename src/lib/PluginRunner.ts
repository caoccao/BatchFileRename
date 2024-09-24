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

import {
  delimiter as tauriApiPathDelimiter,
  sep as tauriApiPathSep,
} from "@tauri-apps/api/path";
import { ConfigPlugin, Item } from "./Protocol";

const path = Object.freeze({
  basename: (p: string): string => {
    const index = p.lastIndexOf(tauriApiPathSep);
    if (index < 0) {
      return p;
    }
    return p.substring(index + 1);
  },
  delimiter: tauriApiPathDelimiter,
  dirname: (p: string): string => {
    const index = p.lastIndexOf(tauriApiPathSep);
    if (index < 0) {
      return "";
    }
    return p.substring(0, index);
  },
  extname: (p: string): string => {
    const index = p.lastIndexOf(".");
    if (index < 0) {
      return "";
    }
    return p.substring(index);
  },
  join: (...paths: string[]): string => {
    paths.forEach((p) => {
      if (typeof p !== "string") {
        throw new TypeError("Arguments must be strings");
      }
    });
    return paths.join(tauriApiPathSep);
  },
  sep: tauriApiPathSep,
});

export function runPlugin(
  plugin: ConfigPlugin,
  items: Item[],
  targetPathsString: string
): string {
  console.log(`Running plugin ${plugin.name}.`);
  const targetPaths = targetPathsString
    .split(/[\r\n]+/g)
    .filter((targetPath) => targetPath.length > 0);
  if (targetPaths.length != items.length) {
    throw new Error(
      `The number of target paths ${targetPaths.length} does not match the number of items ${items.length}.`
    );
  }
  const $sourceItems = Object.freeze(
    items.map((item) => Object.freeze({ sourcePath: item.sourcePath }))
  );
  const $targetItems = Object.freeze(
    items.map((item) => {
      return { targetPath: item.targetPath };
    })
  );
  const options: Record<string, string> = {};
  plugin.options.forEach((option) => {
    options[option.name] = option.defaultValue;
  });
  const $options = Object.freeze(options);
  const $modules = Object.freeze({
    path,
  });
  const fn = new Function(
    "$args",
    `const { $sourceItems, $targetItems, $options, $modules } = $args;\n${plugin.code}`
  );
  const $args = Object.freeze({
    $sourceItems,
    $targetItems,
    $options,
    $modules,
  });
  fn($args);
  return $targetItems.map((targetItem) => targetItem.targetPath).join("\n");
}