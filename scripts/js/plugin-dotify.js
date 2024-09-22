export function dotify(sourceItems, targetItems, options) {
  const ignoredUncapitalizedWordSet = new Set([
    "a",
    "about",
    "above",
    "across",
    "after",
    "around",
    "as",
    "at",
    "before",
    "behind",
    "below",
    "beside",
    "between",
    "by",
    "down",
    "during",
    "for",
    "from",
    "in",
    "into",
    "like",
    "near",
    "of",
    "off",
    "on",
    "onto",
    "out",
    "since",
    "than",
    "the",
    "through",
    "till",
    "to",
    "toward",
    "towards",
    "until",
    "up",
    "with",
    "without",
  ]);
  const length = targetItems.length;
  for (let i = 0; i < length; ++i) {
    const targetItem = targetItems[i];
    const indexOfLastPathSeparator = targetItem.lastIndexOf(
      options.$pathSeparator
    );
    if (indexOfLastPathSeparator >= 0) {
      const parentPath = targetItem.substring(0, indexOfLastPathSeparator + 1);
      const nameAndExt = targetItem.substring(indexOfLastPathSeparator + 1);
      const indexOfLastDot = nameAndExt.lastIndexOf(".");
      if (indexOfLastDot > 0) {
        const name = nameAndExt.substring(0, indexOfLastDot);
        const extWithDot = nameAndExt.substring(indexOfLastDot);
        const newName = name
          .split(/[\s\.,:;\-_\+=\[\]\{\}'"~`!@#$%\^&\*\?\<\>]+/)
          .map((word, index) => {
            if (index == 0) {
              return word[0].toUpperCase() + word.substring(1);
            } else {
              const match = word.match(/^[a-z]+/i);
              if (match) {
                const lowerCasedWord = match[0].toLowerCase();
                if (ignoredUncapitalizedWordSet.has(lowerCasedWord)) {
                  return lowerCasedWord + word.substring(lowerCasedWord.length);
                } else if (word[0].toLowerCase() === word[0]) {
                  return word[0].toUpperCase() + word.substring(1);
                }
              }
            }
            return word;
          })
          .join(".");
        targetItems[i] = `${parentPath}${newName}${extWithDot}`;
      }
    }
  }
}
