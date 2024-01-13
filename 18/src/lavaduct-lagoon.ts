import { createReadStream } from "fs";
import { createInterface } from "readline";
import { once } from "events";

async function main() {
  const lines = await readFile();
  const digPlan = parseDigPlan(lines);
  part1(digPlan);
  const digPlan2 = parseDigPlan2(lines);
  part2(digPlan2);
}

function part1(digPlan: [string, number][]) {
  var yCurrent = 0,
    yMax = 0,
    yMin = 0;
  var xCurrent = 0,
    xMax = 0,
    xMin = 0;
  digPlan.forEach((cmd) => {
    const direction = cmd[0];
    const value = cmd[1];
    const multiplier = ["D", "R"].includes(direction) ? 1 : -1;
    if (["U", "D"].includes(direction)) {
      yCurrent += value * multiplier;
      yMax = Math.max(yCurrent, yMax);
      yMin = Math.min(yCurrent, yMin);
    } else {
      xCurrent += value * multiplier;
      xMax = Math.max(xCurrent, xMax);
      xMin = Math.min(xCurrent, xMin);
    }
  });

  const field: string[][] = new Array(yMax - yMin + 1)
    .fill(null)
    .map((_) => new Array(xMax - xMin + 1).fill("."));
  field[-yMin][-xMin] = "#";

  var location = [-yMin, -xMin];
  digPlan.forEach((cmd) => {
    const direction = cmd[0];
    const value = cmd[1];
    var vector;
    if (direction === "U") {
      vector = [-1, 0];
    } else if (direction === "R") {
      vector = [0, 1];
    } else if (direction === "D") {
      vector = [1, 0];
    } else {
      vector = [0, -1];
    }
    for (let i = 0; i < value; i++) {
      location[0] = location[0] + vector[0];
      location[1] = location[1] + vector[1];
      field[location[0]][location[1]] = "#";
    }
  });

  // drawField(field);

  fillLagoon(field);
  console.log(
    field
      .map((row) => row.filter((value) => value === "#").length)
      .reduce((sum, value) => sum + value, 0)
  );
}

function part2(digPlan: [string, number][]) {
  // shoelace
  // calc vertices
  const vertices = [[0, 0]];
  var previous = vertices[0];
  digPlan.forEach((cmd) => {
    var current;
    const direction = cmd[0];
    const length = cmd[1];
    if (direction === "U") {
      current = [previous[0] - length, previous[1]];
    } else if (direction === "R") {
      current = [previous[0], previous[1] + length];
    } else if (direction === "D") {
      current = [previous[0] + length, previous[1]];
    } else {
      current = [previous[0], previous[1] - length];
    }
    vertices.push(current);
    previous = current;
  });

  var area = 0;
  for (let i = 0; i < vertices.length; i++) {
    const vertice1 = vertices[i];
    const vertice2 = vertices[i === vertices.length - 1 ? 0 : i + 1];
    area += vertice1[1] * vertice2[0] - vertice1[0] * vertice2[1];
  }
  area /= 2;
  area = Math.abs(area);
  const perimeter = digPlan
    .map((cmd) => cmd[1])
    .reduce((sum, value) => sum + value, -1);
  area += Math.round(perimeter / 2) + 1;
  console.log(area);
}

function fillLagoon(map: string[][]) {
  // flood fill outside
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      // only edges in the middle
      if (y !== 0 && y !== map.length - 1) {
        if (x === 1) {
          x = map[y].length - 2;
          continue;
        }
      }

      if (map[y][x] === "#") {
        continue;
      }
      floodFill(map, [[y, x]]);
    }
  }
  // fill inside
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      if (map[y][x] === ".") {
        map[y][x] = "#";
      }
    }
  }
  // undo outside flood
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      if (map[y][x] === "F") {
        map[y][x] = ".";
      }
    }
  }
}

function floodFill(map: string[][], stack: [number, number][]) {
  while (stack.length !== 0) {
    const [y, x] = stack.pop();
    map[y][x] = "F";
    //up
    if (y > 0 && map[y - 1][x] === ".") {
      stack.push([y - 1, x]);
    }
    //right
    if (x < map[y].length - 1 && map[y][x + 1] === ".") {
      stack.push([y, x + 1]);
    }
    //down
    if (y < map.length - 1 && map[y + 1][x] === ".") {
      stack.push([y + 1, x]);
    }
    //left
    if (x > 0 && map[y][x - 1] === ".") {
      stack.push([y, x - 1]);
    }
  }
}

function drawField(field: string[][]) {
  field.forEach((row) => console.log(row.join("")));
}

function parseDigPlan(lines: String[]): [string, number][] {
  return lines.map((line) => {
    var [direction, steps, color] = line.split(" ");
    return [direction, parseInt(steps)];
  });
}

function parseDigPlan2(lines: String[]): [string, number][] {
  return lines.map((line) => {
    var [_, _, color] = line.split(" ");
    var cleanColor = color.substring(2, color.length - 1);
    var direction = new Map<string, string>([
      ["0", "R"],
      ["1", "D"],
      ["2", "L"],
      ["3", "U"],
    ]).get(cleanColor.slice(-1));
    var steps: number = Number(
      "0x" + cleanColor.slice(0, cleanColor.length - 1)
    );
    return [direction, steps];
  });
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
