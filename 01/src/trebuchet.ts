import { createReadStream } from "fs";
import { createInterface } from "readline";
import { once } from "events";

async function main() {
  const lines = await readFile();
  part1(lines);
  part2(lines);
}

function part1(lines) {
  var sum = 0;
  lines.forEach((line) => {
    var firstNum = "",
      lastNum = "";
    [...line].forEach((c) => {
      if (c >= "0" && c <= "9") {
        if (firstNum === "") {
          firstNum = c;
        }
        lastNum = c;
      }
    });
    sum += parseInt(firstNum + lastNum);
  });
  console.log(sum);
}

function part2(lines) {
  const updatedLines = [];
  lines.forEach((line) => {
    var resultLine = "";
    [...line].forEach((c) => {
      resultLine += c;
      resultLine = resultLine
        .replace("one", "1e")
        .replace("two", "2o")
        .replace("three", "3e")
        .replace("four", "4")
        .replace("five", "5e")
        .replace("six", "6")
        .replace("seven", "7n")
        .replace("eight", "8t")
        .replace("nine", "9e");
    });
    updatedLines.push(resultLine);
  });
  part1(updatedLines);
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
