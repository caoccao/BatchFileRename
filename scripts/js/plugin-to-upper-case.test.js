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

import { testPlugin } from "./test-utils.js";
import { toUpperCase } from "./plugin-to-upper-case.js";

const options = { includeName: "true", includeExtension: "false" };

testPlugin(toUpperCase, null, null, options);
testPlugin(toUpperCase, "/test/a b c.x", "/test/A B C.x", options);
testPlugin(toUpperCase, "/test/A B C.x", "/test/A B C.x", options);
testPlugin(toUpperCase, "/test/A B C.X", "/test/A B C.X", options);
testPlugin(toUpperCase, "/test/AaA BbB CcC.X", "/test/AAA BBB CCC.X", options);

options.includeExtension = "true";

testPlugin(toUpperCase, null, null, options);
testPlugin(toUpperCase, "/test/a b c.x", "/test/A B C.X", options);
testPlugin(toUpperCase, "/test/A B C.x", "/test/A B C.X", options);
testPlugin(toUpperCase, "/test/A B C.x", "/test/A B C.X", options);
testPlugin(toUpperCase, "/test/AaA BbB CcC.x", "/test/AAA BBB CCC.X", options);

options.includeName = "false";
options.includeExtension = "false";

testPlugin(toUpperCase, null, null, options);
testPlugin(toUpperCase, "/test/a b c.x", "/test/a b c.x", options);
testPlugin(toUpperCase, "/test/A B C.x", "/test/A B C.x", options);
testPlugin(toUpperCase, "/test/A B C.X", "/test/A B C.X", options);
testPlugin(toUpperCase, "/test/AaA BbB CcC.X", "/test/AaA BbB CcC.X", options);

options.includeExtension = "true";

testPlugin(toUpperCase, null, null, options);
testPlugin(toUpperCase, "/test/a b c.x", "/test/a b c.X", options);
testPlugin(toUpperCase, "/test/A B C.x", "/test/A B C.X", options);
testPlugin(toUpperCase, "/test/A B C.X", "/test/A B C.X", options);
testPlugin(toUpperCase, "/test/AaA BbB CcC.X", "/test/AaA BbB CcC.X", options);
