import { createReadStream, write } from "fs";
import { createInterface } from "readline";
import { once } from "events";

async function main() {
  const lines = await readFile();
  const wires = parseWires(lines);
  part1(wires);
}

function part1(wires: Map<string, Set<string>>) {
  const group = new Set(Array.from(wires.keys()));
  while (getTotalConnectionCountOutsideOfGroup(wires, group) != 3) {
    group.delete(getNodeWithHighestConnectionCountOutsideOfGroup(wires, group));
  }
  const result = group.size * (wires.size - group.size);
  console.log(result);
}

function getTotalConnectionCountOutsideOfGroup(
  wires: Map<string, Set<string>>,
  group: Set<string>
) {
  var connectionCountOutsideOfGroup = 0;
  for (let node of group) {
    for (let connection of wires.get(node)) {
      if (!group.has(connection)) {
        connectionCountOutsideOfGroup++;
      }
    }
  }
  return connectionCountOutsideOfGroup;
}

function getNodeWithHighestConnectionCountOutsideOfGroup(
  wires: Map<string, Set<string>>,
  group: Set<string>
) {
  var highestConnectionCountOutsideOfGroup = 0;
  var nodeToReturn = group.values().next().value;
  for (let node of group) {
    var connectionCountOutsideOfGroup = 0;
    for (let connection of wires.get(node)) {
      if (!group.has(connection)) {
        connectionCountOutsideOfGroup++;
      }
    }
    if (connectionCountOutsideOfGroup > highestConnectionCountOutsideOfGroup) {
      highestConnectionCountOutsideOfGroup = connectionCountOutsideOfGroup;
      nodeToReturn = node;
    }
  }
  return nodeToReturn;
}

function parseWires(lines: String[]): Map<string, Set<string>> {
  const wires = new Map<string, Set<string>>();
  lines.forEach((line) => {
    const [node, connectedNodesString] = line.split(": ");
    const connectedComps = connectedNodesString.split(" ");
    addToWires(wires, node, connectedComps);
    connectedComps.forEach((connectedNode) =>
      addToWires(wires, connectedNode, [node])
    );
  });
  return wires;
}

function addToWires(
  wires: Map<string, Set<string>>,
  comp: string,
  connectedComps: string[]
) {
  if (!wires.has(comp)) {
    wires.set(comp, new Set<string>());
  }
  connectedComps.forEach((connectedComp) => wires.get(comp).add(connectedComp));
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
