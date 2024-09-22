import { assert } from "./utils.js";
import { dotify } from "./plugin-dotify.js";

const options = {
  $pathSeparator: "/",
};
let targetItems = [];
let message;

message = JSON.stringify(targetItems);
dotify([], targetItems, options);
assert(targetItems.length == 0, message);

targetItems = [{ targetPath: "/test/a b c.x" }];
message = JSON.stringify(targetItems);
dotify([], targetItems, options);
assert(targetItems[0] === "/test/A.B.C.x", message);

targetItems = [{ targetPath: "/test/a &b&c.x" }];
message = JSON.stringify(targetItems);
dotify([], targetItems, options);
assert(targetItems[0] === "/test/A.and.B.and.C.x", message);

targetItems = [{ targetPath: "/test/abc,=,def.x" }];
message = JSON.stringify(targetItems);
dotify([], targetItems, options);
assert(targetItems[0] === "/test/Abc.Def.x", message);

targetItems = [{ targetPath: "/test/aBC,OF,dEF.x" }];
message = JSON.stringify(targetItems);
dotify([], targetItems, options);
assert(targetItems[0] === "/test/ABC.of.DEF.x", message);

