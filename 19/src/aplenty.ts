import { createReadStream } from "fs";
import { createInterface } from "readline";
import { once } from "events";

async function main() {
  const lines = await readFile();
  const [workflows, parts] = parseWorkflowsAndParts(lines);
  part1(workflows, parts);
  part2(workflows);
}

type Workflows = Map<string, WorkflowCheck[]>;
type WorkflowCheck = [
  category: string,
  checkType: string,
  checkValue: number,
  result: string
];
type Part = Map<string, number>;

function part1(workflows: Workflows, parts: Part[]) {
  const result = parts
    .map((part) => {
      var next = "in";
      while (true) {
        next = resolveNextStep(part, workflows.get(next));
        if (next === "A") {
          return part;
        } else if (next === "R") {
          return null;
        }
      }
    })
    .filter((part) => part !== null)
    .reduce(
      (sum, part) =>
        sum +
        Array.from(part.values()).reduce((attrSum, attr) => attrSum + attr, 0),
      0
    );
  console.log(result);
}

function part2(workflows: Workflows) {
  const validStates: Map<string, [number, number]>[] = [];
  const initialState: [string, number, Map<string, [number, number]>] = [
    "in",
    0,
    new Map<string, [number, number]>([
      ["x", [1, 4000]],
      ["m", [1, 4000]],
      ["a", [1, 4000]],
      ["s", [1, 4000]],
    ]),
  ];
  const queue = [initialState];
  while (queue.length !== 0) {
    const state = queue.pop();
    if (state[0] === "A") {
      validStates.push(state[2]);
      continue;
    } else if (state[0] === "R") {
      continue;
    }

    const check = workflows.get(state[0])[state[1]];
    const [category, checkType, checkValue, result] = check;

    if (category === null) {
      queue.push([result, 0, state[2]]); // go to next workflow or end
      continue;
    }

    var newRestrictionNextWorkflow: [number, number];
    var newRestrictionContinueWorkflow: [number, number];
    if (checkType === "<") {
      newRestrictionNextWorkflow = [1, checkValue - 1];
      newRestrictionContinueWorkflow = [checkValue, 4000];
    } else {
      newRestrictionNextWorkflow = [checkValue + 1, 4000];
      newRestrictionContinueWorkflow = [1, checkValue];
    }

    queueNext(queue, result, 0, state[2], category, newRestrictionNextWorkflow);
    queueNext(
      queue,
      state[0],
      state[1] + 1,
      state[2],
      category,
      newRestrictionContinueWorkflow
    );
  }

  const result = validStates
    .map((state) =>
      Array.from(state.keys())
        .map((key) => {
          const range = state.get(key);
          return range[1] - range[0] + 1;
        })
        .reduce((sum, range) => sum * range, 1)
    )
    .reduce((sum, stateSum) => sum + stateSum, 0);

  console.log(result);
}

function queueNext(
  queue: [string, number, Map<string, [number, number]>][],
  workflowCode: string,
  step: number,
  restrictions: Map<string, [number, number]>,
  category: string,
  newRestriction: [number, number]
) {
  const updatedRestrictions = new Map<string, [number, number]>();

  "xmas".split("").forEach((i) => {
    const currentRestrictionOnCat = restrictions.get(i);
    if (i === category) {
      const updatedRestriction = intersect(
        currentRestrictionOnCat,
        newRestriction
      );
      if (updatedRestriction === null) {
        return;
      }
      updatedRestrictions.set(i, updatedRestriction);
    } else {
      updatedRestrictions.set(i, [
        currentRestrictionOnCat[0],
        currentRestrictionOnCat[1],
      ]);
    }
  });

  queue.push([workflowCode, step, updatedRestrictions]);
}

function intersect(
  one: [number, number],
  two: [number, number]
): [number, number] {
  //get the range with the smaller starting point (min) and greater start (max)
  var min = one[0] < two[0] ? one : two;
  var max = min[0] === one[0] && min[1] === one[1] ? two : one;

  //min ends before max starts -> no intersection
  if (min[1] < max[0]) {
    return null; //the ranges don't intersect
  }

  return [max[0], min[1] < max[1] ? min[1] : max[1]];
}

function resolveNextStep(part: Part, checks: WorkflowCheck[]): string {
  for (let i = 0; i < checks.length; i++) {
    const check = checks[i];
    const [category, checkType, checkValue, result] = check;

    if (category === null) {
      return result;
    }

    const value = part.get(category);
    if (checkType === "<") {
      if (value < checkValue) {
        return result;
      }
    } else {
      if (value > checkValue) {
        return result;
      }
    }
  }
}

function parseWorkflowsAndParts(lines: String[]): [Workflows, Part[]] {
  const workflows = new Map<string, WorkflowCheck[]>(),
    parts = [];

  lines.forEach((line) => {
    if (line.length === 0) {
      return;
    }

    if (line.startsWith("{")) {
      const [x, m, a, s] = line
        .substring(1, line.length - 1)
        .split(",")
        .map((partValue) => partValue.split("=")[1])
        .map((n) => parseInt(n));
      parts.push(
        new Map<string, number>([
          ["x", x],
          ["m", m],
          ["a", a],
          ["s", s],
        ])
      );
    } else {
      var [name, rest] = line.split(/{|}/);
      const checks = rest.split(",").map((checkString) => {
        if (checkString.includes("<")) {
          const checkSplit = checkString.split(/<|:/);
          return [
            checkSplit[0],
            "<",
            parseInt(checkSplit[1]),
            checkSplit[2],
          ] as WorkflowCheck;
        } else if (checkString.includes(">")) {
          const checkSplit = checkString.split(/>|:/);
          return [
            checkSplit[0],
            ">",
            parseInt(checkSplit[1]),
            checkSplit[2],
          ] as WorkflowCheck;
        } else {
          return [null, null, null, checkString] as WorkflowCheck;
        }
      });
      workflows.set(name, checks);
    }
  });

  return [workflows, parts];
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
