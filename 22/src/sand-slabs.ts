import { createReadStream } from "fs";
import { createInterface } from "readline";
import { once } from "events";

type Brick = [BrickCoord, BrickCoord];
type BrickCoord = [number, number, number];

async function main() {
  const lines = await readFile();
  const [brickSpace, bricks] = parseBricks(lines);

  // start from bottom, sort on Z ascending
  bricks.sort(
    (brick1, brick2) =>
      Math.min(...brick1.map((i) => i[2])) -
      Math.min(...brick2.map((i) => i[2]))
  );

  // drop bricks if hanging
  bricks.forEach((brick) => dropBrick(brickSpace, brick));

  part1(brickSpace, bricks);
  part2(brickSpace, bricks);
}

function part1(brickSpace: boolean[][][], bricks: Brick[]) {
  bricks.forEach((brick) => dropBrick(brickSpace, brick));
  const count = bricks.filter((brick) =>
    canDisintegrate(brickSpace, brick, bricks)
  ).length;
  console.log(count);
}

function part2(brickSpace: boolean[][][], bricks: Brick[]) {
  const count = bricks
    .map((brick) =>
      countMovingBricksAfterDisintegration(brickSpace, brick, bricks)
    )
    .reduce((sum, movingBricks) => sum + movingBricks, 0);
  console.log(count);
}

function countMovingBricksAfterDisintegration(
  brickSpace: boolean[][][],
  brick: Brick,
  bricks: Brick[]
): number {
  const brickSpaceDupe = duplicateSpace(brickSpace);

  const start = brick[0];
  const end = brick[1];
  // erase from space
  for (let x = start[0]; x <= end[0]; x++) {
    for (let y = start[1]; y <= end[1]; y++) {
      for (let z = start[2]; z <= end[2]; z++) {
        brickSpaceDupe[x][y][z] = false;
      }
    }
  }

  return bricks
    .filter((_brick) => _brick[0][2] > brick[0][2]) // only need to consider bricks above currently observed one
    .filter((_brick) => dropBrick(brickSpaceDupe, _brick, false)).length;
}

function duplicateSpace(brickSpace: boolean[][][]) {
  return brickSpace.map((x) => x.map((y) => y.map((z) => z)));
}

function canDisintegrate(
  brickSpace: boolean[][][],
  brick: Brick,
  bricks: Brick[]
): boolean {
  const start = brick[0];
  const end = brick[1];
  // erase from space
  for (let x = start[0]; x <= end[0]; x++) {
    for (let y = start[1]; y <= end[1]; y++) {
      for (let z = start[2]; z <= end[2]; z++) {
        brickSpace[x][y][z] = false;
      }
    }
  }

  const result = bricks
    .filter((_brick) => _brick[0][2] > brick[0][2]) // only need to consider bricks above currently observed one
    .every((_brick) => !canDropBrick(brickSpace, _brick));

  // undo erase
  for (let x = start[0]; x <= end[0]; x++) {
    for (let y = start[1]; y <= end[1]; y++) {
      for (let z = start[2]; z <= end[2]; z++) {
        brickSpace[x][y][z] = true;
      }
    }
  }

  return result;
}

function canDropBrick(brickSpace: boolean[][][], brick: Brick): boolean {
  const start = brick[0];
  const end = brick[1];
  const z = start[2];
  if (z === 1) {
    return false; // cant go lower
  }

  // check if can fall
  for (let x = start[0]; x <= end[0]; x++) {
    for (let y = start[1]; y <= end[1]; y++) {
      if (brickSpace[x][y][z - 1]) {
        // has brick underneath
        return false;
      }
    }
  }
  return true;
}

function dropBrick(
  brickSpace: boolean[][][],
  brick: Brick,
  updateBrickReference: boolean = true
): boolean {
  const start = brick[0];
  const end = brick[1];
  const z = start[2];
  if (z === 1) {
    return false; // cant go lower
  }

  // check if can fall
  for (let x = start[0]; x <= end[0]; x++) {
    for (let y = start[1]; y <= end[1]; y++) {
      if (brickSpace[x][y][z - 1]) {
        // has brick underneath
        return false;
      }
    }
  }

  // move in space
  for (let x = start[0]; x <= end[0]; x++) {
    for (let y = start[1]; y <= end[1]; y++) {
      for (let z = start[2]; z <= end[2]; z++) {
        brickSpace[x][y][z] = false;
        brickSpace[x][y][z - 1] = true;
      }
    }
  }

  if (updateBrickReference) {
    // move in brick referce array
    start[2] = start[2] - 1;
    end[2] = end[2] - 1;
  }

  // try to drop further
  dropBrick(brickSpace, brick, updateBrickReference);
  return true;
}

function parseBricks(lines: String[]): [boolean[][][], Brick[]] {
  const bricks: Brick[] = lines.map(
    (line) =>
      line
        .split("~")
        .map(
          (brickPart) =>
            brickPart.split(",").map((n) => parseInt(n)) as BrickCoord
        ) as Brick
  );
  return [createBrickSpace(bricks), bricks];
}

function createBrickSpace(bricks: Brick[]): boolean[][][] {
  // second part of input entry always has the highest value
  var xMax = 0,
    yMax = 0,
    zMax = 0;
  bricks.forEach((brick) => {
    xMax = Math.max(xMax, brick[1][0]);
    yMax = Math.max(yMax, brick[1][1]);
    zMax = Math.max(zMax, brick[1][2]);
  });
  const space = new Array(xMax + 1)
    .fill(null)
    .map((x) =>
      new Array(yMax + 1).fill(null).map((y) => new Array(zMax + 1).fill(false))
    );
  bricks.forEach((brick) => {
    const start = brick[0];
    const end = brick[1];
    for (let x = start[0]; x <= end[0]; x++) {
      for (let y = start[1]; y <= end[1]; y++) {
        for (let z = start[2]; z <= end[2]; z++) {
          space[x][y][z] = true;
        }
      }
    }
  });
  return space;
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
