import { createReadStream } from "fs";
import { createInterface } from "readline";
import { once } from "events";

async function main() {
  const lines = await readFile();
  const contraption = parseContraption(lines);
  part1(contraption);
  part2(contraption);
}

function part1(contraption: string[][]) {
  const pathReference: string[][][] = new Array(contraption.length)
    .fill(null)
    .map((n, i) => new Array(contraption[i].length).fill(null).map((n) => []));

  followBeam(0, 0, ">", pathReference, contraption);

  const energizedTileCount = pathReference
    .map((row) => row.filter((tile) => tile.length > 0).length)
    .reduce((sum, val) => sum + val, 0);
  console.log(energizedTileCount);
}

function part2(contraption: string[][]) {
  var max = 0;

  for (let y = 0; y < contraption.length; y++) {
    const right = doRun(y, 0, ">", contraption);
    const left = doRun(y, contraption[y].length - 1, "<", contraption);
    max = Math.max(max, right, left);
  }

  for (let x = 0; x < contraption[0].length; x++) {
    const down = doRun(0, x, "v", contraption);
    const up = doRun(contraption.length - 1, x, "^", contraption);
    max = Math.max(max, down, up);
  }

  console.log(max);
}

function doRun(
  y: number,
  x: number,
  direction: string,
  contraption: string[][]
) {
  const pathReference: string[][][] = new Array(contraption.length)
    .fill(null)
    .map((n, i) => new Array(contraption[i].length).fill(null).map((n) => []));

  followBeam(y, x, direction, pathReference, contraption);

  const energizedTileCount = pathReference
    .map((row) => row.filter((tile) => tile.length > 0).length)
    .reduce((sum, val) => sum + val, 0);
  return energizedTileCount;
}

function followBeam(
  y: number,
  x: number,
  direction: string,
  pathReference: string[][][],
  contraption: string[][]
) {
  // out of bounds
  if (y < 0 || y >= contraption.length || x < 0 || x >= contraption[y].length) {
    return;
  }

  if (pathReference[y][x].includes(direction)) {
    // looping
    return;
  }
  pathReference[y][x].push(direction);

  const currentTile = contraption[y][x];
  if (
    currentTile === "." ||
    (currentTile === "|" && "^v".includes(direction)) ||
    (currentTile === "-" && "<>".includes(direction))
  ) {
    if (direction === "^") {
      followBeam(y - 1, x, direction, pathReference, contraption);
    } else if (direction === ">") {
      followBeam(y, x + 1, direction, pathReference, contraption);
    } else if (direction === "v") {
      followBeam(y + 1, x, direction, pathReference, contraption);
    } else if (direction === "<") {
      followBeam(y, x - 1, direction, pathReference, contraption);
    } else {
      throw new Error("unexpected direction " + direction);
    }
  } else if (currentTile === "|") {
    followBeam(y - 1, x, "^", pathReference, contraption);
    followBeam(y + 1, x, "v", pathReference, contraption);
  } else if (currentTile === "-") {
    followBeam(y, x - 1, "<", pathReference, contraption);
    followBeam(y, x + 1, ">", pathReference, contraption);
  } else if (currentTile === "/") {
    if (direction === "^") {
      followBeam(y, x + 1, ">", pathReference, contraption);
    } else if (direction === ">") {
      followBeam(y - 1, x, "^", pathReference, contraption);
    } else if (direction === "v") {
      followBeam(y, x - 1, "<", pathReference, contraption);
    } else if (direction === "<") {
      followBeam(y + 1, x, "v", pathReference, contraption);
    } else {
      throw new Error("unexpected direction " + direction);
    }
  } else if (currentTile === "\\") {
    if (direction === "^") {
      followBeam(y, x - 1, "<", pathReference, contraption);
    } else if (direction === ">") {
      followBeam(y + 1, x, "v", pathReference, contraption);
    } else if (direction === "v") {
      followBeam(y, x + 1, ">", pathReference, contraption);
    } else if (direction === "<") {
      followBeam(y - 1, x, "^", pathReference, contraption);
    } else {
      throw new Error("unexpected direction " + direction);
    }
  } else {
    throw new Error("unexpected tile " + currentTile);
  }
}

function parseContraption(lines: String[]): string[][] {
  return lines.map((line) => line.split(""));
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
