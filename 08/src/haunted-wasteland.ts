import { createReadStream } from "fs";
import { createInterface } from "readline";
import { once } from "events";

async function main() {
  const lines = await readFile();
  const [instructions, map] = parseMap(lines);
  part1(instructions, map);
  part2(instructions, map);
}

function part1(instructions: string[], map: Map<string, [string, string]>) {
  var currentNode = "AAA";
  var steps = 0;
  for (var steps = 0; currentNode !== "ZZZ"; steps++) {
    const direction = instructions[steps % instructions.length];
    if (direction == "L") {
      currentNode = map.get(currentNode)[0];
    } else {
      currentNode = map.get(currentNode)[1];
    }
  }
  console.log(steps);
}

// LCM
function part2(instructions: string[], map: Map<string, [string, string]>) {
  const currentNodes = Array.from(map.keys()).filter((key) =>
    key.endsWith("A")
  );
  const stepsToZ = new Array<number>(currentNodes.length).fill(0);
  var firstZ = 0;

  for (var steps = 0; !canFindLCM(stepsToZ); steps++) {
    const direction = instructions[steps % instructions.length];
    currentNodes.forEach((currentNode, i) => {
      if (direction == "L") {
        currentNodes[i] = map.get(currentNode)[0];
      } else {
        currentNodes[i] = map.get(currentNode)[1];
      }
    });
    currentNodes.forEach((currentNode, i) => {
      if (currentNode.endsWith("Z")) {
        if (firstZ === 0) {
          firstZ = steps;
        }
        if (stepsToZ[i] === 0) {
          stepsToZ[i] = -steps; // start count
        } else if (stepsToZ[i] < 0) {
          stepsToZ[i] = steps + stepsToZ[i];
        }
      }
    });
  }
  console.log(calculateLCM(stepsToZ));
}

function canFindLCM(stepsToZ: number[]) {
  return stepsToZ.every((steps) => steps > 0);
}

function calculateLCM(stepsToZ: number[]) {
  const gcd = (a, b) => (a ? gcd(b % a, a) : b);
  const lcm = (a, b) => (a * b) / gcd(a, b);
  return stepsToZ.reduce(lcm);
}

function parseMap(lines: string[]): [string[], Map<string, [string, string]>] {
  const instructions = lines[0].split("");
  const map = new Map<string, [string, string]>();
  lines.slice(2).map((line) => {
    const [node, directions] = line.split(" = ");
    const [directionTuple1, directionTuple2] = directions
      .replace("(", "")
      .replace(")", "")
      .split(", ");
    map.set(node, [directionTuple1, directionTuple2]);
  });
  return [instructions, map];
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
