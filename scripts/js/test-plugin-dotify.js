import { dotify } from "./plugin-dotify.js";

const options = {
  $pathSeparator: "/",
};
let targetItems = [];

dotify([], targetItems, options);
if (targetItems.length == 0) {
  console.info("✅ Empty target items passed.");
} else {
  console.error("❌ Empty target items failed.");
}

targetItems = ["/test/a b c.x"];
dotify([], targetItems, options);
if (targetItems[0] === "/test/A.B.C.x") {
  console.info(`✅ ${targetItems} passed.`);
} else {
  console.error(`❌ ${targetItems} failed.`);
}
