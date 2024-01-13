import { createReadStream } from "fs";
import { createInterface } from "readline";
import { once } from "events";

async function main() {
  const lines = await readFile();
  const [seeds, maps] = parseSeedsAndMaps(lines);
  part1(seeds, maps);
  part2(seeds, maps);
}

class MapEntry {
  source: number;
  destination: number;
  range: number;
}

function part1(seeds: number[], maps: MapEntry[][]) {
  const values = seeds.map((seed) => {
    maps.forEach((map) => {
      for (const entry of map) {
        if (seed >= entry.source && seed < entry.source + entry.range) {
          seed += entry.destination - entry.source;
          return;
        }
      }
    });
    return seed;
  });
  console.log(Math.min.apply(Math, values));
}

function part2(seeds: number[], maps: MapEntry[][]) {
  var seedRanges: [number, number][] = [];
  seeds.forEach((seed, idx) => {
    if (idx % 2 == 0) {
      const start = seed,
        end = seed + seeds[idx + 1] - 1;
      seedRanges.push([start, end]);
    }
  });
  maps.forEach((map) => {
    var newSeedRanges: [number, number][] = [];

    map.forEach((entry) => {
      for (let idx = 0; idx < seedRanges.length; idx++) {
        var seedRange = seedRanges[idx];
        // no overlap
        if (
          seedRange[0] > entry.source + entry.range - 1 ||
          seedRange[1] < entry.source
        ) {
          continue;
        }

        // entry fully overlaps seed
        if (
          seedRange[0] >= entry.source &&
          seedRange[1] < entry.source + entry.range
        ) {
          var start = seedRange[0] + (entry.destination - entry.source),
            end = seedRange[1] + (entry.destination - entry.source);
          newSeedRanges.push([start, end]);
          seedRanges.splice(idx, 1); // remove
          idx--;
          continue;
        }

        // seed fully overlaps entry
        if (
          seedRange[0] < entry.source &&
          seedRange[1] > entry.source + entry.range - 1
        ) {
          // map middle
          var start = entry.source + (entry.destination - entry.source),
            end = entry.source + entry.range - 1 + (entry.destination - entry.source);
          newSeedRanges.push([start, end]);
          // left tail
          seedRanges.push([seedRange[0], entry.source - 1]);
          // right tail
          seedRanges.push([entry.source + entry.range + 1, seedRange[1]]);
          seedRanges.splice(idx, 1); // remove
          idx--;
          continue;
        }

        // seed end overlaps entry start
        if (seedRange[0] < entry.source && seedRange[1] >= entry.source) {
          newSeedRanges.push([
            entry.source + (entry.destination - entry.source),
            seedRange[1] + (entry.destination - entry.source),
          ]);
          // seed start splice
          seedRanges.push([seedRange[0], entry.source - 1]);
          seedRanges.splice(idx, 1); // remove
          idx--;
          continue;
        } else {
          // seed start overlaps entry end
          newSeedRanges.push([
            seedRange[0] + (entry.destination - entry.source),
            entry.source + entry.range - 1 + (entry.destination - entry.source),
          ]);
          // seed end splice
          seedRanges.push([entry.source + entry.range, seedRange[1]]);
          seedRanges.splice(idx, 1); // remove
          idx--;
          continue;
        }
      }
    });
    newSeedRanges = newSeedRanges.concat(seedRanges);
    seedRanges = newSeedRanges;
  });

  console.log(
    Math.min.apply(
      Math,
      seedRanges.map((range) => range[0])
    )
  );
}

function parseSeedsAndMaps(lines: String[]): [number[], MapEntry[][]] {
  const seeds: number[] = lines[0]
    .split(": ")[1]
    .split(" ")
    .map((seed) => parseInt(seed));

  const maps: MapEntry[][] = [];
  lines.slice(2).forEach((line) => {
    if (line.includes(":")) {
      maps.push([]);
      return;
    }
    if (!line) {
      return;
    }

    const values = line.split(" ").map((value) => parseInt(value));
    const mapEntry: MapEntry = {
      destination: values[0],
      source: values[1],
      range: values[2],
    };
    maps[maps.length - 1].push(mapEntry);
  });

  return [seeds, maps];
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
