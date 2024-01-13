import { createReadStream } from "fs";
import { createInterface } from "readline";
import { once } from "events";

async function main() {
  const lines = await readFile();
  const sequence = parseSequence(lines);
  part1(sequence);
  part2(sequence);
}

function part1(sequence: string[]) {
  const sum = sequence
    .map((step) => hash(step))
    .reduce((sum, value) => sum + value, 0);
  console.log(sum);
}

function part2(sequence: string[]) {
  const boxes: [string, number][][] = new Array(256).fill(null).map((n) => []);
  const labelToBoxMap = new Map();
  sequence.forEach((step) => {
    if (step.includes("=")) {
      const [label, lens] = step.split("=");
      doInsert(boxes, label, parseInt(lens), labelToBoxMap);
    } else {
      doRemoval(boxes, step.split("-")[0], labelToBoxMap);
    }
  });
  const focusingPower = boxes
    .map((box, i) => sumBoxLenses(box, i))
    .reduce((sum, value) => sum + value, 0);
  console.log(focusingPower);
}

function sumBoxLenses(box: [string, number][], i: number): number {
  return box
    .map((lens, slot) => (i + 1) * (slot + 1) * lens[1])
    .reduce((sum, value) => sum + value, 0);
}

function doInsert(
  boxes: [string, number][][],
  label: string,
  lens: number,
  labelToBoxMap: Map<string, number>
) {
  const boxIndex = hash(label);
  const box = boxes[boxIndex];
  const lensIndex = box.findIndex((lens) => lens[0] === label);
  if (lensIndex === -1) {
    box.push([label, lens]);
    labelToBoxMap.set(label, boxIndex);
  } else {
    box[lensIndex] = [label, lens];
  }
}

function doRemoval(
  boxes: [string, number][][],
  label: string,
  labelToBoxMap: Map<string, number>
) {
  if (!labelToBoxMap.has(label)) {
    return;
  }
  const boxIndex = labelToBoxMap.get(label);
  const box = boxes[boxIndex];
  const lensIndex = box.findIndex((lens) => lens[0] === label);
  box.splice(lensIndex, 1);
  labelToBoxMap.delete(label);
}

function hash(step: string): number {
  return step
    .split("")
    .map((char) => char.charCodeAt(0))
    .reduce((sum, asciiValue) => ((sum + asciiValue) * 17) % 256, 0);
}

function parseSequence(lines: String[]) {
  return lines[0].split(",");
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
