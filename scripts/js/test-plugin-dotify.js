import { assert, assertPlugin, options } from "./utils.js";
import { dotify } from "./plugin-dotify.js";

const targetItems = [];
const message = JSON.stringify(targetItems);
dotify([], targetItems, options);
assert(targetItems.length == 0, message);

assertPlugin(dotify, "/test/a b c.x", "/test/A.B.C.x");
assertPlugin(dotify, "/test/a &b&c.x", "/test/A.and.B.and.C.x");
assertPlugin(dotify, "/test/abc,=,def.x", "/test/Abc.Def.x");
assertPlugin(dotify, "/test/aBC,OF,dEF.x", "/test/ABC.of.DEF.x");

