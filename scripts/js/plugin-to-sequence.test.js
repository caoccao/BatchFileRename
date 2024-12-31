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

import { testPlugin } from "./test-utils.js";
import { toSequence } from "./plugin-to-sequence.js";

const options = {
  prefix: "",
  suffix: "",
  startAt: 1,
  stepBy: 1,
  padStart: 3,
  padString: "0",
};

testPlugin(toSequence, null, null, options);
testPlugin(toSequence, "/test/abc.x", "/test/001.x", options);

options.prefix = "a";
options.suffix = "b";
options.padStart = 0;

testPlugin(toSequence, "/test/abc.x", "/test/a1b.x", options);
