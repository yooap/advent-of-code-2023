import { createReadStream } from "fs";
import { createInterface } from "readline";
import { once } from "events";

const CYCLE_LOOP_TRACKER = new Map();

async function main() {
  const lines = await readFile();
  const platform = parsePlatform(lines);
  part1(platform);
  const platform2 = parsePlatform(lines);
  part2(platform2);
}

function part1(platform: string[][]) {
  for (let y = 0; y < platform.length; y++) {
    for (let x = 0; x < platform[y].length; x++) {
      if (platform[y][x] === "O") {
        pushNorth(platform, y, x);
      }
    }
  }
  const sum = platform
    .map(
      (row, i) =>
        row.filter((value) => value === "O").length * (platform.length - i)
    )
    .reduce((sum, value) => sum + value, 0);
  console.log(sum);
}

function part2(platform: string[][]) {
  for (let cycle = 0; cycle < 1000000000; cycle++) {
    const cacheKey = getCacheKey(platform);
    if (CYCLE_LOOP_TRACKER.has(cacheKey)) {
      const previousCycle = CYCLE_LOOP_TRACKER.get(cacheKey);
      const cycleStep = cycle - previousCycle;
      while (cycle + cycleStep < 1000000000) {
        cycle += cycleStep;
      }
    } else {
      CYCLE_LOOP_TRACKER.set(cacheKey, cycle);
    }

    for (let y = 0; y < platform.length; y++) {
      for (let x = 0; x < platform[y].length; x++) {
        if (platform[y][x] === "O") {
          pushNorth(platform, y, x);
        }
      }
    }
    for (let x = 0; x < platform[0].length; x++) {
      for (let y = 0; y < platform.length; y++) {
        if (platform[y][x] === "O") {
          pushWest(platform, y, x);
        }
      }
    }
    for (let y = platform.length - 1; y >= 0; y--) {
      for (let x = 0; x < platform[y].length; x++) {
        if (platform[y][x] === "O") {
          pushSouth(platform, y, x);
        }
      }
    }
    for (let x = platform[0].length - 1; x >= 0; x--) {
      for (let y = 0; y < platform.length; y++) {
        if (platform[y][x] === "O") {
          pushEast(platform, y, x);
        }
      }
    }
  }

  const sum = platform
    .map(
      (row, i) =>
        row.filter((value) => value === "O").length * (platform.length - i)
    )
    .reduce((sum, value) => sum + value, 0);
  console.log(sum);
}

function getCacheKey(platform: string[][]) {
  return platform
    .map((row) => row.join(""))
    .reduce((fullKey, row) => fullKey + row, "");
}

function pushNorth(platform: string[][], y: number, x: number) {
  if (y === 0) {
    return;
  }

  if (platform[y - 1][x] === ".") {
    platform[y][x] = ".";
    platform[y - 1][x] = "O";
    pushNorth(platform, y - 1, x);
  }
}

function pushWest(platform: string[][], y: number, x: number) {
  if (x === 0) {
    return;
  }

  if (platform[y][x - 1] === ".") {
    platform[y][x] = ".";
    platform[y][x - 1] = "O";
    pushWest(platform, y, x - 1);
  }
}

function pushSouth(platform: string[][], y: number, x: number) {
  if (y === platform.length - 1) {
    return;
  }

  if (platform[y + 1][x] === ".") {
    platform[y][x] = ".";
    platform[y + 1][x] = "O";
    pushSouth(platform, y + 1, x);
  }
}

function pushEast(platform: string[][], y: number, x: number) {
  if (x === platform[y].length - 1) {
    return;
  }

  if (platform[y][x + 1] === ".") {
    platform[y][x] = ".";
    platform[y][x + 1] = "O";
    pushEast(platform, y, x + 1);
  }
}

function parsePlatform(lines: String[]): string[][] {
  return lines.map((lines) => lines.split(""));
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
