/*
 *   Copyright (c) 2024-2025. caoccao.com Sam Cao
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

import path from "node:path";
import { expect, test } from "vitest";

export function testPlugin(plugin, originalPath, expectedPath, options) {
  const args = {
    $sourceItems: [],
    $targetItems: originalPath ? [{ targetPath: originalPath }] : [],
    $options: options,
    $modules: {
      path,
    },
  };
  const message = "Test: " + JSON.stringify(args.$targetItems);
  plugin(args);
  if (expectedPath) {
    test(message, () => {
      const newPath = args.$targetItems[0].targetPath.replaceAll("\\", "/");
      expect(newPath).toBe(expectedPath);
    });
  } else {
    test(message, () => {
      expect(args.$targetItems.length).toBe(0);
    });
  }
}
