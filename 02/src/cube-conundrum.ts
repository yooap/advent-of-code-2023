import { createReadStream } from "fs";
import { createInterface } from "readline";
import { once } from "events";

const redMax = 12;
const greenMax = 13;
const blueMax = 14;

async function main() {
  const lines = await readFile();
  const games: Game[] = parseGames(lines);
  part1(games);
  part2(games);
}

function part1(games: Game[]) {
  const sum = games
    .filter((game) => game.valid)
    .reduce((sum, game) => sum + game.id, 0);
  console.log(sum);
}

function part2(games: Game[]) {
  const sum = games.reduce(
    (sum, game) => sum + game.redMax * game.greenMax * game.blueMax,
    0
  );
  console.log(sum);
}

function parseGames(lines: String[]) {
  const games: Game[] = [];
  var i = 1;
  lines.forEach((line) => {
    const game = line.split(": ")[1];
    const pulls = game.split(/[,;]\s/);
    var redMaxLocal = 0,
      greenMaxLocal = 0,
      blueMaxLocal = 0,
      invalid = false;
    pulls.forEach((pull) => {
      const [value, color] = pull.split(" ");
      switch (color) {
        case "red": {
          invalid = invalid || parseInt(value) > redMax;
          redMaxLocal = Math.max(redMaxLocal, parseInt(value));
          break;
        }
        case "green": {
          invalid = invalid || parseInt(value) > greenMax;
          greenMaxLocal = Math.max(greenMaxLocal, parseInt(value));
          break;
        }
        case "blue": {
          invalid = invalid || parseInt(value) > blueMax;
          blueMaxLocal = Math.max(blueMaxLocal, parseInt(value));
          break;
        }
      }
    });
    games.push({
      id: i++,
      valid: !invalid,
      redMax: redMaxLocal,
      greenMax: greenMaxLocal,
      blueMax: blueMaxLocal,
    });
  });
  return games;
}

interface Game {
  id: number;
  valid: boolean;
  redMax: number;
  greenMax: number;
  blueMax: number;
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
