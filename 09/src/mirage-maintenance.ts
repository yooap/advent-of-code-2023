import { createReadStream } from "fs";
import { createInterface } from "readline";
import { once } from "events";

async function main() {
  const lines = await readFile();
  const report = parseReport(lines);
  printResult(report);
}

class MapEntry {
  source: number;
  destination: number;
  range: number;
}

function printResult(report: number[][]) {
  var endValueSum = 0;
  var startValueSum = 0;
  report.forEach((entry) => {
    var endValue = 0;
    var startValues = [];
    while (!entry.every((n) => n === 0)) {
      endValue += entry[entry.length - 1];
      startValues.push(entry[0]);
      entry = entry
        .map((n, i) => {
          if (i === entry.length - 1) {
            return null;
          }
          return entry[i + 1] - n;
        })
        .filter((n) => n !== null);
    }
    endValueSum += endValue;

    startValues = startValues.reverse();
    var startValue = 0;
    startValues.forEach((n) => {
      startValue = n - startValue;
    });
    startValueSum += startValue;
  });
  console.log(endValueSum);
  console.log(startValueSum);
}

function parseReport(lines: string[]): number[][] {
  return lines.map((line) => line.split(" ").map((n) => parseInt(n)));
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
