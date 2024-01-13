import { createReadStream } from "fs";
import { createInterface } from "readline";
import { once } from "events";

const START_PATH_TO_TILE_MAPPING = new Map();
START_PATH_TO_TILE_MAPPING.set("1100", "L");
START_PATH_TO_TILE_MAPPING.set("1010", "|");
START_PATH_TO_TILE_MAPPING.set("1001", "J");
START_PATH_TO_TILE_MAPPING.set("0110", "F");
START_PATH_TO_TILE_MAPPING.set("0101", "-");
START_PATH_TO_TILE_MAPPING.set("0011", "7");

async function main() {
  const lines = await readFile();
  const map = parseMaze(lines);
  part1(map);
  part2(map);
}

function part1(map: string[][]) {
  const start = findStart(map);
  var pathCoord = getInitialPath(start, map);
  var pathCoordPrevious = start;
  for (var pathLength = 1; !tuplesEqual(pathCoord, start); pathLength++) {
    const pathCoordCopy: [number, number] = [pathCoord[0], pathCoord[1]];
    moveAlongPath(pathCoord, pathCoordPrevious, map);
    pathCoordPrevious = pathCoordCopy;
  }
  console.log(Math.ceil(pathLength / 2));
}

function tuplesEqual(one: [number, number], two: [number, number]) {
  return one[0] === two[0] && one[1] === two[1];
}

function part2(map: string[][]) {
  const start = findStart(map);
  var pathCoord = getInitialPath(start, map);
  var path = [start];
  for (var pathLength = 1; !tuplesEqual(pathCoord, start); pathLength++) {
    const pathCoordCopy: [number, number] = [pathCoord[0], pathCoord[1]];
    moveAlongPath(pathCoord, path[path.length - 1], map);
    path.push(pathCoordCopy);
  }

  console.log(calcEnclosedPath(path, map));
}

function calcEnclosedPath(path: [number, number][], map: string[][]) {
  const pathBounds = getPathBounds(path);
  const pathMap = getPathMap(path, map);
  var enclosedTileCount = 0;

  for (let y = pathBounds[0]; y < pathBounds[2]; y++) {
    // scan line
    var inside = false;
    for (let x = pathBounds[3]; x <= pathBounds[1]; x++) {
      const tileAbove = pathMap[y][x];
      const tileBelow = pathMap[y + 1][x];
      if (
        [tileBelow, tileAbove].includes("|") ||
        (["F", "7"].includes(tileAbove) && ["J", "L"].includes(tileBelow))
      ) {
        inside = !inside;
      }

      if (inside && tileBelow === null) {
        enclosedTileCount++;
      }
    }
  }

  return enclosedTileCount;
}

function getPathBounds(
  path: [number, number][]
): [number, number, number, number] {
  var minY = path[0][0],
    maxY = path[0][0],
    minX = path[0][1],
    maxX = path[0][1];

  path.forEach((pathSegment) => {
    const y = pathSegment[0],
      x = pathSegment[1];
    if (y < minY) {
      minY = y;
    }
    if (y > maxY) {
      maxY = y;
    }
    if (x < minX) {
      minX = x;
    }
    if (x > maxX) {
      maxX = x;
    }
  });

  return [minY, maxX, maxY, minX];
}

function getPathMap(path: [number, number][], map: string[][]) {
  const pathMap = [];
  map.forEach((row) => {
    pathMap.push(new Array(row.length).fill(null));
  });
  path.forEach((pathSegment) => {
    var tile = map[pathSegment[0]][pathSegment[1]];
    pathMap[pathSegment[0]][pathSegment[1]] = tile;
  });
  //replace start with real tile
  const start = path[0];
  pathMap[start[0]][start[1]] = determineStartTile(pathMap, start);
  return pathMap;
}

function parseMaze(lines: String[]) {
  return lines.map((line) => line.split(""));
}

function determineStartTile(map: string[][], start: [number, number]) {
  const [y, x] = start;
  const up = y === 0 || !["|", "7", "F"].includes(map[y - 1][x]) ? "0" : "1";
  const right =
    x === map[0].length - 1 || !["-", "7", "J"].includes(map[y][x + 1])
      ? "0"
      : "1";
  const down =
    y === map.length - 1 || !["|", "J", "L"].includes(map[y + 1][x])
      ? "0"
      : "1";
  const left = x === 0 || !["-", "L", "F"].includes(map[y][x - 1]) ? "0" : "1";
  return START_PATH_TO_TILE_MAPPING.get(up + right + down + left);
}

function findStart(map: string[][]): [number, number] {
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      if (map[y][x] == "S") {
        return [y, x];
      }
    }
  }
}

function getInitialPath(
  start: [number, number],
  map: string[][]
): [number, number] {
  if (start[0] > 0 && ["F", "7", "|"].includes(map[start[0] - 1][start[1]])) {
    //up
    return [start[0] - 1, start[1]];
  }
  if (
    start[1] + 1 < map[start[0]].length &&
    ["J", "7", "-"].includes(map[start[0]][start[1] + 1])
  ) {
    //right
    return [start[0], start[1] + 1];
  }
  if (
    start[0] + 1 < map.length &&
    ["J", "L", "|"].includes(map[start[0] + 1][start[1]])
  ) {
    //down
    return [start[0] + 1, start[1]];
  }
  if (start[1] > 0 && ["F", "L", "-"].includes(map[start[0]][start[1] - 1])) {
    //left
    return [start[0], start[1] - 1];
  }
}

function moveAlongPath(
  now: [number, number],
  previous: [number, number],
  map: string[][]
) {
  const currentPipe = map[now[0]][now[1]];
  if (currentPipe === "|") {
    if (previous[0] === now[0] - 1) {
      now[0] = now[0] + 1; // go down
    } else {
      now[0] = now[0] - 1; // go up
    }
  } else if (currentPipe === "-") {
    if (previous[1] === now[1] - 1) {
      now[1] = now[1] + 1; // go right
    } else {
      now[1] = now[1] - 1; // go left
    }
  } else if (currentPipe === "L") {
    if (previous[0] === now[0] - 1) {
      now[1] = now[1] + 1; // go right
    } else {
      now[0] = now[0] - 1; // go up
    }
  } else if (currentPipe === "J") {
    if (previous[0] === now[0] - 1) {
      now[1] = now[1] - 1; // go left
    } else {
      now[0] = now[0] - 1; // go up
    }
  } else if (currentPipe === "7") {
    if (previous[0] === now[0] + 1) {
      now[1] = now[1] - 1; // go left
    } else {
      now[0] = now[0] + 1; // go down
    }
  } else if (currentPipe === "F") {
    if (previous[0] === now[0] + 1) {
      now[1] = now[1] + 1; // go right
    } else {
      now[0] = now[0] + 1; // go down
    }
  }
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
