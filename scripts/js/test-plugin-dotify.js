import { assert, assertPlugin, options } from "./utils.js";
import { dotify } from "./plugin-dotify.js";

assertPlugin(dotify, null, null);
assertPlugin(dotify, "/test/a b c.x", "/test/A.B.C.x");
assertPlugin(dotify, "/test/a &b&c.x", "/test/A.and.B.and.C.x");
assertPlugin(dotify, "/test/a &,& b(&&)c.x", "/test/A.and.B.and.C.x");
assertPlugin(dotify, "/test/abc,=,def.x", "/test/Abc.Def.x");
assertPlugin(dotify, "/test/aBC,OF,dEF.x", "/test/ABC.of.DEF.x");
