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

export function dotify($args) {
  const { $targetItems, $options, $utils } = $args;
  const ignoredUncapitalizedWordSet = new Set([
    "a",
    "about",
    "above",
    "across",
    "and",
    "after",
    "around",
    "are",
    "as",
    "at",
    "before",
    "behind",
    "below",
    "beside",
    "between",
    "by",
    "down",
    "during",
    "for",
    "from",
    "in",
    "into",
    "is",
    "like",
    "near",
    "not",
    "of",
    "off",
    "on",
    "onto",
    "or",
    "out",
    "since",
    "than",
    "the",
    "through",
    "till",
    "to",
    "toward",
    "towards",
    "until",
    "up",
    "with",
    "without",
  ]);
  const specialWordReplacementMap = new Map([["&", "and"]]);
  const length = $targetItems.length;
  for (let i = 0; i < length; ++i) {
    const targetPath = $targetItems[i].targetPath;
    const baseName = $utils.path.basename(targetPath);
    if (baseName && baseName.length >= 0) {
      const parentPath = $utils.path.dirname(targetPath);
      const extName = $utils.path.extname(targetPath);
      const name = baseName.substring(0, baseName.length - extName.length);
      const words = [];
      let position = 0;
      for (const match of [
        ...name.matchAll(/[\s\.,:;\-_\+=\[\]\(\)\{\}'"&~`!@#$%\^\*\?\<\>]+/g),
      ]) {
        if (match.index > position) {
          words.push(name.substring(position, match.index));
        }
        const word = match[0];
        position = match.index + word.length;
        for (const entry of [...specialWordReplacementMap.entries()]) {
          if (word.includes(entry[0])) {
            words.push(entry[1]);
            break;
          }
        }
      }
      if (position < name.length) {
        words.push(name.substring(position));
      }
      const newName = words
        .filter((word) => word.length > 0)
        .map((word, index) => {
          if (index == 0) {
            return word[0].toUpperCase() + word.substring(1);
          } else {
            const match = word.match(/^[a-z]+/i);
            if (match) {
              const lowerCasedWord = match[0].toLowerCase();
              if (ignoredUncapitalizedWordSet.has(lowerCasedWord)) {
                return lowerCasedWord + word.substring(lowerCasedWord.length);
              } else if (word[0].toLowerCase() === word[0]) {
                return word[0].toUpperCase() + word.substring(1);
              }
            } else if (specialWordReplacementMap.has(word)) {
              return specialWordReplacementMap.get(word);
            }
          }
          return word;
        })
        .join($options.separator);
      $targetItems[i].targetPath = $utils.path.join(
        parentPath,
        `${newName}${extName}`
      );
    }
  }
}
