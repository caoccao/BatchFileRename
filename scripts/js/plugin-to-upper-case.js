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

export function toUpperCase($args) {
  const { $targetItems, $options, $modules } = $args;
  // Plugin Start
  $targetItems.forEach((targetItem) => {
    const targetPath = targetItem.targetPath;
    const baseName = $modules.path.basename(targetPath);
    if (baseName && baseName.length >= 0) {
      const parentPath = $modules.path.dirname(targetPath);
      const ext = $modules.path.extname(targetPath);
      const name = baseName.substring(0, baseName.length - ext.length);
      const newName = $options.includeName ? name.toUpperCase() : name;
      const newExt = $options.includeExtension ? ext.toUpperCase() : ext;
      targetItem.targetPath = $modules.path.join(
        parentPath,
        `${newName}${newExt}`
      );
    }
  });
  // Plugin End
}
