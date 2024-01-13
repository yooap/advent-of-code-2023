import { createReadStream } from "fs";
import { createInterface } from "readline";
import { once } from "events";

const LOW = 0,
  HIGH = 1;
const OFF = 0,
  ON = 1;
const FLIPFLOP = 0,
  CONJUNCTION = 1;

async function main() {
  const lines = await readFile();
  const modules = parseModules(lines);
  part1(modules);
  const modules2 = parseModules(lines);
  part2(modules2);
}

type Module = {
  type?: number;
  state: number | ConjunctionState;
  output: string[];
};

type ConjunctionState = Map<string, number>;

function part1(modules: Map<string, Module>) {
  const buttonPressCount = 1000;
  var lowCount = 0,
    highCount = 0;
  for (var i = 1; i <= buttonPressCount; i++) {
    var cmdQueue: [string, string, number][] = [[null, "broadcaster", LOW]];
    const [lowCountIncrement, highCountIncrement] = runQueue(cmdQueue, modules);
    lowCount += lowCountIncrement;
    highCount += highCountIncrement;
  }
  console.log(lowCount * highCount);
}

function part2(modules: Map<string, Module>) {
  //find rx output
  const rxOutputmodule = Array.from(modules.values()).filter(
    (module) => module.output[0] === "rx"
  )[0];

  const loopDetection = new Map<string, number>();
  Array.from((rxOutputmodule.state as ConjunctionState).keys()).forEach((key) =>
    loopDetection.set(key, -1)
  );

  var buttonPressCount = 0;
  while (true) {
    buttonPressCount++;
    var cmdQueue: [string, string, number][] = [[null, "broadcaster", LOW]];
    runQueue(cmdQueue, modules, loopDetection, buttonPressCount);
    // check have value for all loops
    if (Array.from(loopDetection.values()).every((val) => val > -1)) {
      break;
    }
  }

  // LCM
  const lcm = calculateLCM(Array.from(loopDetection.values()));
  console.log(lcm);
}

function calculateLCM(stepsToZ: number[]) {
  const gcd = (a, b) => (a ? gcd(b % a, a) : b);
  const lcm = (a, b) => (a * b) / gcd(a, b);
  return stepsToZ.reduce(lcm);
}

function runQueue(
  cmdQueue: [string, string, number][],
  modules: Map<string, Module>,
  loopDetection?: Map<string, number>,
  buttonPressCount?: number
): [number, number] {
  var lowCount = 0,
    highCount = 0;

  while (cmdQueue.length !== 0) {
    var [previosModName, thisModName, pulseType] = cmdQueue.shift();

    if (pulseType === LOW) {
      lowCount++;
    } else {
      highCount++;
    }

    if (!modules.has(thisModName)) {
      continue;
    }

    const module = modules.get(thisModName);

    if (loopDetection !== undefined && module.output[0] === "rx") {
      if (pulseType === HIGH) {
        if (loopDetection.get(previosModName) === -1) {
          loopDetection.set(previosModName, buttonPressCount);
        }
      }
    }

    if (module.type === FLIPFLOP) {
      if (pulseType === HIGH) {
        continue;
      }
      module.state = module.state === 0 ? 1 : 0;
      pulseType = module.state;
    } else if (module.type === CONJUNCTION) {
      const state = module.state as ConjunctionState;
      state.set(previosModName, pulseType);
      pulseType = Array.from(state.values()).every((v) => v === HIGH)
        ? LOW
        : HIGH;
    } else {
      // broadcaster
    }

    module.output.forEach((nextModName) => {
      cmdQueue.push([thisModName, nextModName, pulseType] as [
        string,
        string,
        number
      ]);
    });
  }
  return [lowCount, highCount];
}

function parseModules(lines: String[]): Map<string, Module> {
  const modules = new Map<string, Module>();
  lines.forEach((line) => {
    var [name, output] = line.split(" -> ");
    var type = null;
    var state = null;
    if (name.startsWith("%")) {
      name = name.substring(1);
      type = FLIPFLOP;
      state = 0;
    } else if (name.startsWith("&")) {
      name = name.substring(1);
      type = CONJUNCTION;
      state = new Map<string, number>();
    }
    modules.set(name, {
      type: type,
      state: state,
      output: output.split(", "),
    } as Module);
  });

  // attach conjunction node inputs and outputs
  modules.forEach((module, name) => {
    module.output
      .filter((output) => modules.has(output))
      .map((output) => modules.get(output))
      .filter((outputMod) => outputMod.type === CONJUNCTION)
      .forEach((outputMod) => {
        (outputMod.state as ConjunctionState).set(name, LOW);
      });
  });

  return modules;
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
