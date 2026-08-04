// Splits ONE file's code into function-level chunks
function chunkByFunction(code) {
  const chunks = [];
  const lines = code.split("\n");

  let currentChunk = [];
  let braceDepth = 0;
  let insideFunction = false;
  let startLine = 0;

  let leftover = [];        // NEW: collects lines NOT inside any detected function
  let leftoverStart = 1;    // NEW: tracks where the current leftover block began

  function flushLeftover(endLineNumber) {
    const nonEmpty = leftover.some((l) => l.trim() !== "");
    if (nonEmpty) {
      chunks.push({
        code: leftover.join("\n"),
        startLine: leftoverStart,
        endLine: endLineNumber,
      });
    }
    leftover = [];
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (!insideFunction && /function\s+\w+\s*\(/.test(line)) {
      // Before starting a new function chunk, flush whatever leftover
      // (non-function) code came before it as its own chunk
      flushLeftover(i);

      insideFunction = true;
      startLine = i + 1;
      currentChunk = [];
    }

    if (insideFunction) {
      currentChunk.push(line);
      braceDepth += (line.match(/{/g) || []).length;
      braceDepth -= (line.match(/}/g) || []).length;

      if (braceDepth === 0 && currentChunk.length > 0) {
        chunks.push({
          code: currentChunk.join("\n"),
          startLine: startLine,
          endLine: i + 1,
        });
        insideFunction = false;
        currentChunk = [];
        leftoverStart = i + 2; // next leftover block starts right after this function
      }
    } else {
      leftover.push(line); // NOT inside a function — collect as leftover
    }
  }

  flushLeftover(lines.length); // capture any trailing leftover at the end of the file

  return chunks;


}
// Takes the array of files from walkRepo() and chunks EVERY file,
// attaching the fileName to each resulting chunk
function chunkFiles(files) {
  let allChunks = [];

  for (const file of files) {
    const fileChunks = chunkByFunction(file.content);

    const chunksWithFileName = fileChunks.map((chunk) => ({
      ...chunk,
      fileName: file.fileName,
    }));

    allChunks = allChunks.concat(chunksWithFileName);
  }

  return allChunks;
}

module.exports = { chunkByFunction, chunkFiles };