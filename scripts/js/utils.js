export function assert(condition, message) {
  if (condition) {
    console.info(`✅ ${message} passed.`);
  } else {
    console.error(`❌ ${message} failed.`);
  }
}
