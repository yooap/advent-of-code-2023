import { createReadStream } from "fs";
import { createInterface } from "readline";
import { once } from "events";

async function main() {
  const lines = await readFile();
  const patterns = parsePatterns(lines);
  part1(patterns);
  part2(patterns);
}

function part1(patterns: string[][][]) {
  var sum = 0;
  patterns.forEach((pattern) => {
    sum += summarizePattern(pattern);
  });
  console.log(sum);
}

function summarizePattern(pattern: string[][]) {
  for (let y = 1; y < pattern.length; y++) {
    if (checkReflectsRecursivlyHorizontal(pattern, y - 1, y)) {
      return 100 * y;
    }
  }
  for (let x = 1; x < pattern[0].length; x++) {
    if (checkReflectsRecursivlyVertical(pattern, x - 1, x)) {
      return x;
    }
  }

  throw new Error("no refelection point");
}

function checkReflectsRecursivlyHorizontal(
  pattern: string[][],
  y1: number,
  y2: number
) {
  const row1 = pattern[y1];
  const row2 = pattern[y2];
  for (let i = 0; i < row1.length; i++) {
    if (row1[i] !== row2[i]) {
      return false;
    }
  }

  // check if no more rows to check
  if (y1 === 0 || y2 === pattern.length - 1) {
    return true;
  }

  return checkReflectsRecursivlyHorizontal(pattern, y1 - 1, y2 + 1);
}

function checkReflectsRecursivlyVertical(
  pattern: string[][],
  x1: number,
  x2: number
) {
  const column1 = pattern.map((row) => row[x1]);
  const column2 = pattern.map((row) => row[x2]);
  for (let i = 0; i < column1.length; i++) {
    if (column1[i] !== column2[i]) {
      return false;
    }
  }

  // check if no more rows to check
  if (x1 === 0 || x2 === pattern[0].length - 1) {
    return true;
  }

  return checkReflectsRecursivlyVertical(pattern, x1 - 1, x2 + 1);
}

function part2(patterns: string[][][]) {
  var sum = 0;
  patterns.forEach((pattern) => {
    sum += summarizePatternWithSmudge(pattern);
  });
  console.log(sum);
}

function summarizePatternWithSmudge(pattern: string[][]) {
  for (let y = 1; y < pattern.length; y++) {
    if (checkReflectsRecursivlyHorizontalWithSmudge(pattern, y - 1, y)) {
      return 100 * y;
    }
  }
  for (let x = 1; x < pattern[0].length; x++) {
    if (checkReflectsRecursivlyVerticalWithSmudge(pattern, x - 1, x)) {
      return x;
    }
  }

  throw new Error("no refelection point");
}

function checkReflectsRecursivlyHorizontalWithSmudge(
  pattern: string[][],
  y1: number,
  y2: number
) {
  var potentialSmudgeFound = false;
  const row1 = pattern[y1];
  const row2 = pattern[y2];
  for (let i = 0; i < row1.length; i++) {
    if (row1[i] !== row2[i]) {
      if (potentialSmudgeFound) {
        return false; // second inconsitancy - terminate
      } else {
        potentialSmudgeFound = true;
      }
    }
  }

  // check if no more rows to check
  if (y1 === 0 || y2 === pattern.length - 1) {
    if (potentialSmudgeFound) {
      return true;
    }
    return false; // ignore refelection point for non-smudged version
  }

  if (potentialSmudgeFound) {
    // one smudge corrected - check rest of pattern normally
    return checkReflectsRecursivlyHorizontal(pattern, y1 - 1, y2 + 1);
  }
  return checkReflectsRecursivlyHorizontalWithSmudge(pattern, y1 - 1, y2 + 1);
}

function checkReflectsRecursivlyVerticalWithSmudge(
  pattern: string[][],
  x1: number,
  x2: number
) {
  var potentialSmudgeFound = false;
  const column1 = pattern.map((row) => row[x1]);
  const column2 = pattern.map((row) => row[x2]);
  for (let i = 0; i < column1.length; i++) {
    if (column1[i] !== column2[i]) {
      if (potentialSmudgeFound) {
        return false; // second inconsitancy - terminate
      } else {
        potentialSmudgeFound = true;
      }
    }
  }

  // check if no more rows to check
  if (x1 === 0 || x2 === pattern[0].length - 1) {
    if (potentialSmudgeFound) {
      return true;
    }
    return false; // ignore refelection point for non-smudged version
  }

  if (potentialSmudgeFound) {
    // one smudge corrected - check rest of pattern normally
    return checkReflectsRecursivlyVertical(pattern, x1 - 1, x2 + 1);
  }
  return checkReflectsRecursivlyVerticalWithSmudge(pattern, x1 - 1, x2 + 1);
}

function parsePatterns(lines: String[]): string[][][] {
  const patterns: string[][][] = [];
  var pattern: string[][] = [];
  lines.forEach((line) => {
    if (!line) {
      patterns.push(pattern);
      pattern = [];
      return;
    }

    pattern.push(line.split(""));
  });
  patterns.push(pattern);
  return patterns;
}

const readFile = async () => {
  const lines = [];
  const rlInterface = createInterface({
    input: createReadStream("../input.txt"),
  });
  rlInterface
    .on("line", (line) => {
      lines.push(line);
    })
    .on("close", () => {
      return lines;
    });

  await once(rlInterface, "close");

  return lines;
};

main();
