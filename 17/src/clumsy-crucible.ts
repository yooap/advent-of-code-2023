import { createReadStream } from "fs";
import { createInterface } from "readline";
import { once } from "events";

async function main() {
  const lines = await readFile();
  const heatMap = parseHeatMap(lines);
  part1(heatMap);
  part2(heatMap);
}

class PriorityQueue {
  values: Map<number, string[]>;
  queue: Array<number>;

  constructor() {
    this.values = new Map<number, string[]>();
    this.queue = new Array<number>();
  }

  get() {
    var min = Math.min(...this.queue);
    var valuesForMin = this.values.get(min);
    var returnValue = valuesForMin.pop();
    if (valuesForMin.length === 0) {
      this.queue.splice(this.queue.indexOf(min), 1);
    }
    return returnValue;
  }

  put(node: string, priority: number) {
    if (this.values.has(priority)) {
      this.values.get(priority).push(node);
    } else {
      this.values.set(priority, [node]);
    }

    if (!this.queue.includes(priority)) {
      this.queue.push(priority);
    }
  }

  isEmpty() {
    return this.queue.length === 0;
  }
}

function part1(heatMap: number[][]) {
  const start = toKey([0, 0, null, 0] as [number, number, string, number]);

  var expansion = new PriorityQueue();
  expansion.put(start, 0);

  var visited = new Set<string>();

  const costReferences = new Map<string, number>();
  costReferences.set(start, 0);

  const path = new Map<string, string>();

  const yMax = heatMap.length - 1;
  const xMax = heatMap[0].length - 1;
  const keyPrefixForEnd = yMax + "|" + xMax + "|";

  var current: string;
  while (!expansion.isEmpty()) {
    current = expansion.get();

    if (current.startsWith(keyPrefixForEnd)) {
      break;
    }

    const currentCost = costReferences.get(current);
    visited.add(current);
    const neighbors = getNeighbors(current, visited, yMax, xMax);
    for (let i = 0; i < neighbors.length; i++) {
      const neighbor = neighbors[i];
      const [y, x] = fromKey(neighbor);
      const newCost = currentCost + heatMap[y][x];
      if (
        !costReferences.has(neighbor) ||
        newCost < costReferences.get(neighbor)
      ) {
        costReferences.set(neighbor, newCost);
        expansion.put(neighbor, newCost);
        path.set(neighbor, current);
      }
    }
  }

  // drawPath(heatMap, path, current);

  console.log(costReferences.get(current));
}

function part2(heatMap: number[][]) {
  const start = toKey([0, 0, null, 0] as [number, number, string, number]);

  var expansion = new PriorityQueue();
  expansion.put(start, 0);

  var visited = new Set<string>();

  const costReferences = new Map<string, number>();
  costReferences.set(start, 0);

  const path = new Map<string, string>();

  const yMax = heatMap.length - 1;
  const xMax = heatMap[0].length - 1;
  const keyPrefixForEnd = yMax + "|" + xMax + "|";

  var current: string;
  while (!expansion.isEmpty()) {
    current = expansion.get();

    if (current.startsWith(keyPrefixForEnd)) {
      const times = fromKey(current)[3];
      if (times >= 4) {
        // check if at least 4 steps taken before in same direction
        break;
      } else {
        continue;
      }
    }

    const currentCost = costReferences.get(current);
    visited.add(current);
    const neighbors = getNeighborsUltra(current, visited, yMax, xMax);
    for (let i = 0; i < neighbors.length; i++) {
      const neighbor = neighbors[i];
      const [y, x] = fromKey(neighbor);
      const newCost = currentCost + heatMap[y][x];
      if (
        !costReferences.has(neighbor) ||
        newCost < costReferences.get(neighbor)
      ) {
        costReferences.set(neighbor, newCost);
        expansion.put(neighbor, newCost);
        path.set(neighbor, current);
      }
    }
  }

  // drawPath(heatMap, path, current);

  console.log(costReferences.get(current));
}

function drawPath(heatMap: number[][], path: Map<string, string>, end: string) {
  const heatMapDupe: String[][] = heatMap.map((row) =>
    row.map((x) => x.toString())
  );
  var current = end;
  while (!current.startsWith("0|0|")) {
    const [y, x, direction] = fromKey(current);
    heatMapDupe[y][x] = direction;
    current = path.get(current);
  }
  heatMapDupe.forEach((row) => console.log(row.join("")));
}

function getNeighbors(
  nodeKey: string,
  visited: Set<string>,
  yMax: number,
  xMax: number
): string[] {
  const neighbors: [number, number, string, number][] = [];

  const node = fromKey(nodeKey);
  var [y, x, direction, times] = node;

  //up
  if (
    y > 0 &&
    direction !== "v" &&
    !(times === 3 && direction === "^") &&
    !(y - 1 === 0 && x === 0)
  ) {
    const up: [number, number, string, number] = [
      y - 1,
      x,
      "^",
      direction === "^" ? times + 1 : 1,
    ];
    if (!visited.has(toKey(up))) {
      neighbors.push(up);
    }
  }
  //right
  if (x < xMax && direction !== "<" && !(times === 3 && direction === ">")) {
    const right: [number, number, string, number] = [
      y,
      x + 1,
      ">",
      direction === ">" ? times + 1 : 1,
    ];
    if (!visited.has(toKey(right))) {
      neighbors.push(right);
    }
  }
  //down
  if (y < yMax && direction !== "^" && !(times === 3 && direction === "v")) {
    const down: [number, number, string, number] = [
      y + 1,
      x,
      "v",
      direction === "v" ? times + 1 : 1,
    ];
    if (!visited.has(toKey(down))) {
      neighbors.push(down);
    }
  }
  //left
  if (
    x > 0 &&
    direction !== ">" &&
    !(times === 3 && direction === "<") &&
    !(y === 0 && x - 1 === 0)
  ) {
    const left: [number, number, string, number] = [
      y,
      x - 1,
      "<",
      direction === "<" ? times + 1 : 1,
    ];
    if (!visited.has(toKey(left))) {
      neighbors.push(left);
    }
  }

  return neighbors.map((n) => toKey(n));
}

function getNeighborsUltra(
  nodeKey: string,
  visited: Set<string>,
  yMax: number,
  xMax: number
): string[] {
  const node = fromKey(nodeKey);
  var [y, x, direction, times] = node;

  // check if needs to go same direction
  if (times != 0 && times < 4) {
    var vector: [number, number];
    if (direction === "^") {
      vector = [-1, 0];
    } else if (direction === ">") {
      vector = [0, 1];
    } else if (direction === "v") {
      vector = [1, 0];
    } else {
      vector = [0, -1];
    }
    const next: [number, number, String, number] = [
      y + vector[0],
      x + vector[1],
      direction,
      times + 1,
    ];

    if (next[0] < 0 || next[0] > yMax || next[1] < 0 || next[1] > xMax) {
      return [];
    }

    const nextKey = toKey(next);
    return visited.has(nextKey) ? [] : [nextKey];
  }

  const neighbors: [number, number, string, number][] = [];

  //up
  if (
    y > 0 &&
    direction !== "v" &&
    !(times === 10 && direction === "^") &&
    !(y - 1 === 0 && x === 0)
  ) {
    const up: [number, number, string, number] = [
      y - 1,
      x,
      "^",
      direction === "^" ? times + 1 : 1,
    ];
    if (!visited.has(toKey(up))) {
      neighbors.push(up);
    }
  }
  //right
  if (x < xMax && direction !== "<" && !(times === 10 && direction === ">")) {
    const right: [number, number, string, number] = [
      y,
      x + 1,
      ">",
      direction === ">" ? times + 1 : 1,
    ];
    if (!visited.has(toKey(right))) {
      neighbors.push(right);
    }
  }
  //down
  if (y < yMax && direction !== "^" && !(times === 10 && direction === "v")) {
    const down: [number, number, string, number] = [
      y + 1,
      x,
      "v",
      direction === "v" ? times + 1 : 1,
    ];
    if (!visited.has(toKey(down))) {
      neighbors.push(down);
    }
  }
  //left
  if (
    x > 0 &&
    direction !== ">" &&
    !(times === 10 && direction === "<") &&
    !(y === 0 && x - 1 === 0)
  ) {
    const left: [number, number, string, number] = [
      y,
      x - 1,
      "<",
      direction === "<" ? times + 1 : 1,
    ];
    if (!visited.has(toKey(left))) {
      neighbors.push(left);
    }
  }

  return neighbors.map((n) => toKey(n));
}

function toKey(node: [number, number, String, number]) {
  return node.join("|");
}

function fromKey(nodeKey: String): [number, number, String, number] {
  var [y, x, direction, times] = nodeKey.split("|");
  return [parseInt(y), parseInt(x), direction, parseInt(times)];
}

function parseHeatMap(lines: String[]): number[][] {
  return lines.map((line) => line.split("").map((n) => parseInt(n)));
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
