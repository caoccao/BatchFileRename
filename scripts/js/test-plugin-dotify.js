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

import { assertPlugin } from "./utils.js";
import { dotify } from "./plugin-dotify.js";

const options = {
  separator: ".",
};

assertPlugin(dotify, null, null, options);
assertPlugin(dotify, "/test/a b c.x", "/test/A.B.C.x", options);
assertPlugin(dotify, "/test/a &b&c.x", "/test/A.and.B.and.C.x", options);
assertPlugin(dotify, "/test/a &,& b(&&)c.x", "/test/A.and.B.and.C.x", options);
assertPlugin(dotify, "/test/abc,=,def.x", "/test/Abc.Def.x", options);
assertPlugin(dotify, "/test/aBC,OF,dEF.x", "/test/ABC.of.DEF.x", options);
