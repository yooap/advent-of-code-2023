import { createReadStream } from "fs";
import { createInterface } from "readline";
import { once } from "events";

const STEP_COUNT = 64;

async function main() {
  const lines = await readFile();
  const map = parseMap(lines);
  part1(map);
  part2(map);
}

function part1(map: string[][]) {
  const start = findStart(map);
  var stateQueue = new Set<string>();
  stateQueue.add(start);
  for (let step = 0; step < STEP_COUNT; step++) {
    stateQueue = walk(map, stateQueue);
  }
  //drawMap(map, stateQueue);
  console.log(stateQueue.size);
}

function part2(map: string[][]) {
  const yMid = (map.length - 1) / 2,
    xMid = (map[0].length - 1) / 2,
    yMax = map.length - 1,
    xMax = map[0].length - 1;

  var stepsToGetToBorderOfFirstMap = (map.length - 1) / 2;
  var stepsToGetToBorderWithTopOrBottomStart = map.length;

  // square - so will take the same
  const stepsToGetToBorderWithLeftOrRightStart =
    stepsToGetToBorderWithTopOrBottomStart;

  //var steps = 26501365;
  var steps = 26501365;
  steps -= stepsToGetToBorderOfFirstMap;
  var expensionCounter = 0;
  while (steps >= stepsToGetToBorderWithLeftOrRightStart) {
    steps -= stepsToGetToBorderWithLeftOrRightStart;
    expensionCounter++;
  }
  // "steps" should be 0 now - for this specific input
  // console.log(steps);
  // "expensionCounter" should be even number - for this specific input
  // console.log(expensionCounter);

  const start = findStart(map);

  var filledEven,
    filledOdd,
    tHalfFilled,
    rHalfFilled,
    bHalfFilled,
    lHalfFilled,
    trQuarterFilled,
    brQuarterFilled,
    blQuarterFilled,
    tlQuarterFilled,
    trHalfFilled,
    brHalfFilled,
    blHalfFilled,
    tlHalfFilled;

  var firstMapStateQueue = new Set<string>(),
    tStateQueue = new Set<string>(),
    rStateQueue = new Set<string>(),
    bStateQueue = new Set<string>(),
    lStateQueue = new Set<string>(),
    trStateQueue = new Set<string>(),
    brStateQueue = new Set<string>(),
    blStateQueue = new Set<string>(),
    tlStateQueue = new Set<string>();

  firstMapStateQueue.add(start);

  // simulate first cycles
  // reach end of first map
  for (let step = 0; step < stepsToGetToBorderOfFirstMap; step++) {
    firstMapStateQueue = walk(map, firstMapStateQueue);
  }
  // first half of cycle
  for (let step = 0; step < stepsToGetToBorderWithTopOrBottomStart; step++) {
    firstMapStateQueue = walk(map, firstMapStateQueue);
    if (step === 0) {
      tStateQueue.add(encodeCoords(yMax, xMid));
      rStateQueue.add(encodeCoords(yMid, 0));
      bStateQueue.add(encodeCoords(0, xMid));
      lStateQueue.add(encodeCoords(yMid, xMax));
      continue;
    }
    tStateQueue = walk(map, tStateQueue);
    rStateQueue = walk(map, rStateQueue);
    bStateQueue = walk(map, bStateQueue);
    lStateQueue = walk(map, lStateQueue);
    if (step > stepsToGetToBorderOfFirstMap) {
      if (step === stepsToGetToBorderOfFirstMap+1) {
        trStateQueue.add(encodeCoords(yMax, 0));
        brStateQueue.add(encodeCoords(0, 0));
        blStateQueue.add(encodeCoords(0, xMax));
        tlStateQueue.add(encodeCoords(yMax, xMax));
        continue;
      }
      trStateQueue = walk(map, trStateQueue);
      brStateQueue = walk(map, brStateQueue);
      blStateQueue = walk(map, blStateQueue);
      tlStateQueue = walk(map, tlStateQueue);
    }
  }
  tHalfFilled = tStateQueue.size;
  rHalfFilled = rStateQueue.size;
  bHalfFilled = bStateQueue.size;
  lHalfFilled = lStateQueue.size;
  trQuarterFilled = trStateQueue.size;
  brQuarterFilled = brStateQueue.size;
  blQuarterFilled = blStateQueue.size;
  tlQuarterFilled = tlStateQueue.size;

  // second half of cycle
  for (let step = 0; step < stepsToGetToBorderWithTopOrBottomStart; step++) {
    firstMapStateQueue = walk(map, firstMapStateQueue);
    tStateQueue = walk(map, tStateQueue);
    rStateQueue = walk(map, rStateQueue);
    bStateQueue = walk(map, bStateQueue);
    lStateQueue = walk(map, lStateQueue);
    trStateQueue = walk(map, trStateQueue);
    brStateQueue = walk(map, brStateQueue);
    blStateQueue = walk(map, blStateQueue);
    tlStateQueue = walk(map, tlStateQueue);
  }
  trHalfFilled = trStateQueue.size;
  brHalfFilled = brStateQueue.size;
  blHalfFilled = blStateQueue.size;
  tlHalfFilled = tlStateQueue.size;

  filledOdd = tStateQueue.size;

  // run another step to get filledEven value
  tStateQueue = walk(map, tStateQueue);
  filledEven = tStateQueue.size;

  // console.log("firstMapStateQueue.size:" + firstMapStateQueue.size);
  // console.log("tHalfFilled:" + tHalfFilled);
  // console.log("rHalfFilled:" + rHalfFilled);
  // console.log("bHalfFilled:" + bHalfFilled);
  // console.log("lHalfFilled:" + lHalfFilled);
  // console.log("trQuarterFilled:" + trQuarterFilled);
  // console.log("brQuarterFilled:" + brQuarterFilled);
  // console.log("blQuarterFilled:" + blQuarterFilled);
  // console.log("tlQuarterFilled:" + tlQuarterFilled);
  // console.log("trHalfFilled:" + trHalfFilled);
  // console.log("brHalfFilled:" + brHalfFilled);
  // console.log("blHalfFilled:" + blHalfFilled);
  // console.log("tlHalfFilled:" + tlHalfFilled);
  // console.log("filledEven:" + filledEven);
  // console.log("filledOdd:" + filledOdd);

  var total = 0;
  total += firstMapStateQueue.size;
  var oddLast = 4,
    evenLast = 0,
    oddToal = oddLast,
    evenTotal = evenLast;
  for (let i = 1; i < expensionCounter / 2; i++) {
    oddLast += 8;
    evenLast += 8;
    oddToal += oddLast;
    evenTotal += evenLast;
  }
  // console.log("oddToal:" + oddToal);
  // console.log("evenTotal:" + evenTotal);
  total += oddToal * filledOdd;
  total += evenTotal * filledEven;
  total +=
    expensionCounter *
    (trQuarterFilled + brQuarterFilled + blQuarterFilled + tlQuarterFilled);
  total +=
    (-1 + expensionCounter) *
    (trHalfFilled + brHalfFilled + blHalfFilled + tlHalfFilled);
  total += tHalfFilled + rHalfFilled + bHalfFilled + lHalfFilled;
  console.log(total);
}

function drawMap(map: string[][], states: Set<string>) {
  const mapDupe = map.map((row) => row.map((v) => v));
  states.forEach((state) => {
    const [y, x] = decodeCoords(state);
    mapDupe[y][x] = "O";
  });
  mapDupe.forEach((row) => console.log(row.join("")));
}

function walk(map: string[][], queue: Set<string>) {
  const updatedQueue = new Set<string>();
  queue.forEach((state) => {
    const [y, x] = decodeCoords(state);
    //up
    if (y > 0 && isValid(y - 1, x, map)) {
      updatedQueue.add(encodeCoords(y - 1, x));
    }
    //right
    if (x < map[y].length - 1 && isValid(y, x + 1, map)) {
      updatedQueue.add(encodeCoords(y, x + 1));
    }
    //down
    if (y < map.length - 1 && isValid(y + 1, x, map)) {
      updatedQueue.add(encodeCoords(y + 1, x));
    }
    //left
    if (x > 0 && isValid(y, x - 1, map)) {
      updatedQueue.add(encodeCoords(y, x - 1));
    }
  });
  return updatedQueue;
}

function isValid(y: number, x: number, map: string[][]) {
  return map[y][x] !== "#";
}

function findStart(map: string[][]): string {
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      if (map[y][x] === "S") {
        return encodeCoords(y, x);
      }
    }
  }
}

function encodeCoords(y: number, x: number) {
  return y + "|" + x;
}

function decodeCoords(yx: string) {
  return yx.split("|").map((c) => parseInt(c));
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
