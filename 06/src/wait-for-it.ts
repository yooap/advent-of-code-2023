import { createReadStream } from "fs";
import { createInterface } from "readline";
import { once } from "events";

async function main() {
  const lines = await readFile();
  const races: Race[] = parseRaces(lines);
  part1(races);
  part2(races);
}

class Race {
  time: number;
  distance: number;
}

function parseRaces(lines: String[]) {
  var time, distance;
  lines.forEach((line) => {
    const array = line.split(/\s+/).slice(1);
    if (line.startsWith("Time")) {
      time = array;
    } else {
      distance = array;
    }
  });

  const races: Race[] = [];
  time.forEach((_, i) => {
    races.push({ time: time[i], distance: distance[i] });
  });
  return races;
}

function part1(races: Race[]) {
  const margin = races
    .map((race) => {
      var validChoices = 0;
      for (let i = 1; i < race.time; i++) {
        const myDistance = (race.time - i) * i;
        if (myDistance > race.distance) {
          validChoices++;
        } else if (validChoices > 0) {
          break; // no more valid runs possible
        }
      }
      return validChoices;
    })
    .reduce((sum, value) => sum * value, 1);
  console.log(margin);
}

function part2(races: Race[]) {
  var concatenatedTime = "";
  var concatenatedDistance = "";
  races.forEach((race) => {
    concatenatedTime = concatenatedTime + race.time;
    concatenatedDistance = concatenatedDistance + race.distance;
  });
  const concatenatedRace: Race = {
    time: parseInt(concatenatedTime),
    distance: parseInt(concatenatedDistance),
  };
  part1([concatenatedRace]);
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
