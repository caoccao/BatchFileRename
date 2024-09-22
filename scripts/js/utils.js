export const options = {
  $pathSeparator: "/",
};

export function assert(condition, message) {
  if (condition) {
    console.info(`✅ ${message} passed.`);
  } else {
    console.error(`❌ ${message} failed.`);
  }
}

export function assertPlugin(plugin, path, expectedPath) {
  const targetItems = [{ targetPath: path }];
  const message = JSON.stringify(targetItems);
  plugin([], targetItems, options);
  assert(targetItems[0].targetPath === expectedPath, message);
}
