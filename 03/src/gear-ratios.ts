import { createReadStream } from "fs";
import { createInterface } from "readline";
import { once } from "events";

async function main() {
  const lines = await readFile();
  const schema: [][] = parseSchema(lines);
  part1(schema);
  part2(schema);
}

function part1(schema: [][]) {
  const yMax = schema.length,
    xMax = schema[0].length;
  var currentNumber = "",
    currentValid = false,
    sum = 0;
  schema.forEach((row, y) => {
    row.forEach((value, x) => {
      if (isNaN(value)) {
        if (currentNumber != "") {
          if (currentValid) {
            sum += parseInt(currentNumber);
            currentValid = false;
          }
          currentNumber = "";
        }
        return;
      }

      currentNumber += value;
      if (currentValid) {
        return;
      }

      //check up
      if (y - 1 >= 0) {
        const up = schema[y - 1][x];
        if (isSymbol(up)) {
          currentValid = true;
          return;
        }
        //up left
        if (x - 1 >= 0) {
          const upLeft = schema[y - 1][x - 1];
          if (isSymbol(upLeft)) {
            currentValid = true;
            return;
          }
        }
        //up right
        if (x + 1 < xMax) {
          const upRight = schema[y - 1][x + 1];
          if (isSymbol(upRight)) {
            currentValid = true;
            return;
          }
        }
      }
      //check down
      if (y + 1 < yMax) {
        const down = schema[y + 1][x];
        if (isSymbol(down)) {
          currentValid = true;
          return;
        }
        //down left
        if (x - 1 >= 0) {
          const downLeft = schema[y + 1][x - 1];
          if (isSymbol(downLeft)) {
            currentValid = true;
            return;
          }
        }
        //down right
        if (x + 1 < xMax) {
          const downRight = schema[y + 1][x + 1];
          if (isSymbol(downRight)) {
            currentValid = true;
            return;
          }
        }
      }
      //check left
      if (x - 1 >= 0) {
        const left = schema[y][x - 1];
        if (isSymbol(left)) {
          currentValid = true;
          return;
        }
      }
      //check right
      if (x + 1 < xMax) {
        const right = schema[y][x + 1];
        if (isSymbol(right)) {
          currentValid = true;
          return;
        }
      }
    });

    //end of row
    if (currentValid) {
      sum += parseInt(currentNumber);
      currentValid = false;
    }
    currentNumber = "";
  });

  console.log(sum);
}

function isSymbol(char) {
  return isNaN(char) && char != ".";
}

function part2(schema: [][]) {
  const yMax = schema.length,
    xMax = schema[0].length;
  var numbers: number[] = [],
    sum = 0;
  schema.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value == "*") {
        var number = "";
        //check up
        if (y - 1 >= 0) {
          const top = schema[y - 1][x];
          if (isNaN(top)) {
            number = ".";
          } else {
            number = top;
          }

          // move left
          var xOffset = -1;
          while (x + xOffset >= 0) {
            const next = schema[y - 1][x + xOffset];
            if (isNaN(next)) {
              break;
            }
            number = next + number;
            xOffset--;
          }

          // move right
          xOffset = 1;
          while (x + xOffset < xMax) {
            const next = schema[y - 1][x + xOffset];
            if (isNaN(next)) {
              break;
            }
            number = number + next;
            xOffset++;
          }

          number
            .split(".")
            .filter((n) => n != "")
            .forEach((n) => {
              numbers.push(parseInt(n));
            });
          number = "";
        }

        //check down
        if (y + 1 < yMax) {
          const bottom = schema[y + 1][x];
          if (isNaN(bottom)) {
            number = ".";
          } else {
            number = bottom;
          }

          // move left
          var xOffset = -1;
          while (x + xOffset >= 0) {
            const next = schema[y + 1][x + xOffset];
            if (isNaN(next)) {
              break;
            }
            number = next + number;
            xOffset--;
          }

          // move right
          xOffset = 1;
          while (x + xOffset < xMax) {
            const next = schema[y + 1][x + xOffset];
            if (isNaN(next)) {
              break;
            }
            number = number + next;
            xOffset++;
          }

          number
            .split(".")
            .filter((n) => n != "")
            .forEach((n) => {
              numbers.push(parseInt(n));
            });
          number = "";
        }

        //lef and right

        var number = "";
        var xOffset = -1;
        //left
        while (x + xOffset >= 0) {
          const next = schema[y][x + xOffset];
          if (isNaN(next)) {
            break;
          }
          number = next + number;
          xOffset--;
        }
        if (number != "") {
          numbers.push(parseInt(number));
        }

        number = "";
        xOffset = 1;
        //right
        while (x + xOffset < xMax) {
          const next = schema[y][x + xOffset];
          if (isNaN(next)) {
            break;
          }
          number = number + next;
          xOffset++;
        }
        if (number != "") {
          numbers.push(parseInt(number));
        }

        if (numbers.length == 2) {
          sum = sum + numbers[0] * numbers[1];
        }
        numbers.length = 0;
      }
    });
  });

  console.log(sum);
}

function parseSchema(lines: String[]) {
  const schema = [];
  lines.forEach((line) => schema.push([...line]));
  return schema;
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
