import { createReadStream } from "fs";
import { createInterface } from "readline";
import { once } from "events";

const CACHE = new Map();

async function main() {
  const lines = await readFile();
  const [field, conditionRecord] = parseField(lines);
  part1(field, conditionRecord);
  part2(field, conditionRecord);
}

function part1(field: string[][], conditionRecord: number[][]) {
  CACHE.clear();
  var permutations = 0;
  conditionRecord.forEach((record, i) => {
    const fieldRow = field[i];
    permutations += countPermutations(fieldRow, record);
  });
  console.log(permutations);
}
function part2(field: string[][], conditionRecord: number[][]) {
  unfold(field, conditionRecord);
  part1(field, conditionRecord);
}

function unfold(field: string[][], conditionRecord: number[][]) {
  field.forEach((row, i) => {
    const record = conditionRecord[i];
    const rowLength = row.length;
    const recordLength = record.length;
    for (let _ = 0; _ < 4; _++) {
      row.push("?");
      for (let ii = 0; ii < rowLength; ii++) {
        row.push(row[ii]);
      }

      for (let ii = 0; ii < recordLength; ii++) {
        record.push(record[ii]);
      }
    }
  });
}

function countPermutations(row: string[], record: number[]) {
  const cacheKey = getCacheKey(row, record);
  if (CACHE.has(cacheKey)) {
    return CACHE.get(cacheKey);
  }

  var permutations = 0;
  const group = record[0];
  // try to place
  row.forEach((_, i) => {
    const lastGroup = record.length === 1;
    if (canPlace(row, i, group, lastGroup)) {
      if (lastGroup) {
        // last group placed, permutation found
        permutations++;
      } else {
        // place next group
        permutations += countPermutations(
          row.slice(i + group + 1),
          record.slice(1)
        );
      }
    }
  });
  CACHE.set(cacheKey, permutations);
  return permutations;
}

function getCacheKey(row: string[], record: number[]) {
  return row.join("") + "|" + record.map((n) => n.toString()).join(",");
}

function canPlace(
  row: string[],
  start: number,
  spaces: number,
  lastGroup: boolean
) {
  // end early if not enough spaces left
  if (start + spaces > row.length) {
    return false;
  }

  // can not place if has confimed wells behind it
  if (start > 0 && row.slice(0, start).some((c) => c === "#")) {
    return false;
  }

  for (let i = start; i < start + spaces; i++) {
    if (row[i] === ".") {
      return false;
    }
  }

  // can not place if last group and has a confimed wells after it
  if (
    lastGroup &&
    row.length !== start + spaces &&
    row.slice(start + spaces).some((c) => c === "#")
  ) {
    return false;
  }

  return (
    row.length === start + spaces ||
    row[start + spaces] === "." ||
    row[start + spaces] === "?"
  );
}

function parseField(lines: string[]): [string[][], number[][]] {
  const field: string[][] = [],
    conditionRecord: number[][] = [];
  lines.forEach((line) => {
    const [fieldPart, conditionPart] = line.split(" ");
    field.push(fieldPart.split(""));
    conditionRecord.push(conditionPart.split(",").map((n) => parseInt(n)));
  });

  return [field, conditionRecord];
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
