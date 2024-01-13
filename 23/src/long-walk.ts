import { createReadStream } from "fs";
import { createInterface } from "readline";
import { once } from "events";

async function main() {
  const lines = await readFile();
  const map = parseMap(lines);
  part1(map);
  part2(map);
}

type State = [Set<string>, string, string]; // visited, previous, present
type StateV2 = [Set<string>, string, number]; // visited nodes, present, length

function part1(map: string[][]) {
  const start = toKey(0, 1);
  const startState: State = [new Set<string>(), null, start];
  startState[0].add(start);
  const states: State[] = [startState];

  const end = toKey(map.length - 1, map[0].length - 2);
  var longestPath = 0;

  while (states.length !== 0) {
    const state = states.shift();
    const path = state[0];
    const previous = state[1];
    const present = state[2];
    if (present === end) {
      longestPath = Math.max(longestPath, path.size);
      continue;
    }

    const [y, x] = fromKey(state[2]);
    var next: string;
    //up
    if (y > 1 && !"#v".includes(map[y - 1][x])) {
      next = toKey(y - 1, x);
      if (validateNext(path, previous, next)) {
        pushNewState(states, path, present, next);
      }
    }
    //right
    if (!"#<".includes(map[y][x + 1])) {
      next = toKey(y, x + 1);
      if (validateNext(path, previous, next)) {
        pushNewState(states, path, present, next);
      }
    }
    //down
    if (!"#^".includes(map[y + 1][x])) {
      next = toKey(y + 1, x);
      if (validateNext(path, previous, next)) {
        pushNewState(states, path, present, next);
      }
    }
    //left
    if (!"#>".includes(map[y][x - 1])) {
      next = toKey(y, x - 1);
      if (validateNext(path, previous, next)) {
        pushNewState(states, path, present, next);
      }
    }
  }

  console.log(longestPath);
}

function part2(map: string[][]) {
  removeSlopes(map);

  // create graph
  const start = toKey(0, 1);
  const end = toKey(map.length - 1, map[0].length - 2);
  const graph = new Map<string, [string, number][]>();
  const queue: string[] = [start];
  var longestPath = 0;

  while (queue.length !== 0) {
    const node = queue.shift();
    const directions = getPossibleMoves(node, map);

    graph.set(node, []);
    directions.forEach((direction) => {
      var [crossroads, length] = walkUntilCrossroads(
        node,
        direction,
        map,
        start,
        end
      );
      if (!graph.has(crossroads) && crossroads !== end) {
        queue.push(crossroads);
      }
      graph.get(node).push([crossroads, length]);
    });
  }

  // traverse graph
  const startState: StateV2 = [new Set<string>(), start, 0];
  const states: StateV2[] = [startState];
  while (states.length !== 0) {
    const state = states.shift();
    const path = state[0];
    const present = state[1];
    const length = state[2];
    if (present === end) {
      longestPath = Math.max(longestPath, length);
      continue;
    }

    const validDirections = graph
      .get(present)
      .filter((direction) => !path.has(direction[0]));

    const canGoToEnd = validDirections.some(
      (direction) => direction[0] === end
    );

    graph
      .get(present)
      .filter((direction) => !path.has(direction[0]))
      .filter((direction) => !canGoToEnd || direction[0] === end)
      .forEach((direction) => {
        const newPath = new Set<string>(path);
        newPath.add(present);
        const newState = [
          newPath,
          direction[0],
          state[2] + direction[1],
        ] as StateV2;
        states.push(newState);
      });
  }

  console.log(longestPath);
}

function getPossibleMoves(node: string, map: string[][]): string[] {
  var [y, x] = fromKey(node);

  const up = y != 0 && map[y - 1][x] === "." ? toKey(y - 1, x) : null,
    right = map[y][x + 1] === "." ? toKey(y, x + 1) : null,
    down = map[y + 1][x] === "." ? toKey(y + 1, x) : null,
    left = map[y][x - 1] === "." ? toKey(y, x - 1) : null;

  return [up, right, down, left].filter((direction) => direction !== null);
}

function walkUntilCrossroads(
  previousNode: string,
  currentNode: string,
  map: string[][],
  start: string,
  end: string
): [string, number] {
  //check if at crossroads
  if ([start, end].includes(currentNode)) {
    return [currentNode, 1];
  }

  const directions = getPossibleMoves(currentNode, map);
  if (directions.length > 2) {
    // crossroads
    return [currentNode, 1];
  }

  const nextNode = directions.filter(
    (direction) => direction !== previousNode
  )[0];

  const walkingResult = walkUntilCrossroads(
    currentNode,
    nextNode,
    map,
    start,
    end
  );
  return [walkingResult[0], walkingResult[1] + 1];
}

function removeSlopes(map: string[][]) {
  map.forEach((row) =>
    row.forEach((value, x) => {
      if ("^>v<".includes(value)) {
        row[x] = ".";
      }
    })
  );
}

function toKey(y: number, x: number) {
  return y + "|" + x;
}

function fromKey(yx: string) {
  return yx.split("|").map((coord) => parseInt(coord));
}

function validateNext(
  path: Set<string>,
  previous: string,
  next: string
): boolean {
  return next !== previous && !path.has(next);
}

function pushNewState(
  states: State[],
  path: Set<string>,
  present: string,
  next: string
) {
  states.push([copySet(path, present), present, next]);
}

function copySet(oldSet: Set<string>, newStep: string) {
  const newSet = new Set<string>(oldSet);
  newSet.add(newStep);
  return newSet;
}

function parseMap(lines: String[]): string[][] {
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
