export function dotify(sourceItems, targetItems, options) {
  const ignoredUncapitalizedWordSet = new Set([
    "a",
    "about",
    "above",
    "across",
    "and",
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
    "not",
    "of",
    "off",
    "on",
    "onto",
    "or",
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
  const specialWordReplacementMap = new Map([["&", "and"]]);
  const length = targetItems.length;
  for (let i = 0; i < length; ++i) {
    const targetPath = targetItems[i].targetPath;
    const indexOfLastPathSeparator = targetPath.lastIndexOf(
      options.$pathSeparator
    );
    if (indexOfLastPathSeparator >= 0) {
      const parentPath = targetPath.substring(0, indexOfLastPathSeparator + 1);
      const nameAndExt = targetPath.substring(indexOfLastPathSeparator + 1);
      const indexOfLastDot = nameAndExt.lastIndexOf(".");
      if (indexOfLastDot > 0) {
        const name = nameAndExt.substring(0, indexOfLastDot);
        const extWithDot = nameAndExt.substring(indexOfLastDot);
        const words = [];
        let position = 0;
        for (const match of [
          ...name.matchAll(/[\s\.,:;\-_\+=\[\]\(\)\{\}'"&~`!@#$%\^\*\?\<\>]+/g),
        ]) {
          if (match.index > position) {
            words.push(name.substring(position, match.index));
          }
          const word = match[0];
          position = match.index + word.length;
          for (const entry of [...specialWordReplacementMap.entries()]) {
            if (word.includes(entry[0])) {
              words.push(entry[1]);
              break;
            }
          }
        }
        if (position < name.length) {
          words.push(name.substring(position));
        }
        const newName = words
          .filter((word) => word.length > 0)
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
              } else if (specialWordReplacementMap.has(word)) {
                return specialWordReplacementMap.get(word);
              }
            }
            return word;
          })
          .join(".");
        targetItems[i].targetPath = `${parentPath}${newName}${extWithDot}`;
      }
    }
  }
}
