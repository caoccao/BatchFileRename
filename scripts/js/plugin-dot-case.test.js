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
import { dotCase } from "./plugin-dot-case.js";

const options = { separator: "." };

testPlugin(dotCase, null, null, options);
testPlugin(dotCase, "/test/a b c.x", "/test/A.B.C.x", options);
testPlugin(dotCase, "/test/a &b&c.x", "/test/A.and.B.and.C.x", options);
testPlugin(dotCase, "/test/a &,& b(&&)c.x", "/test/A.and.B.and.C.x", options);
testPlugin(dotCase, "/test/abc,=,def.x", "/test/Abc.Def.x", options);
testPlugin(dotCase, "/test/aBC,OF,dEF.x", "/test/ABC.of.DEF.x", options);
testPlugin(dotCase, "/test/123.the.abc.x", "/test/123.The.Abc.x", options);
