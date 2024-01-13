import { createReadStream } from "fs";
import { createInterface } from "readline";
import { once } from "events";

// const MIN = 7;
const MIN = 200000000000000;
// const MAX = 27;
const MAX = 400000000000000;

type Bound = [number, number];
const ROCK_V_BOUND = 500;

async function main() {
  const lines = await readFile();
  const hailstones = parseHail(lines);
  part1(hailstones);
  part2(hailstones);
}

type Hail = {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
};

function part1(hailstones: Hail[]) {
  var intersections = 0;
  // ax+by+c=0
  for (let i = 0; i < hailstones.length; i++) {
    for (let j = i + 1; j < hailstones.length; j++) {
      if (intersects(hailstones, i, j)) {
        intersections++;
      }
    }
  }
  console.log(intersections);
}

function intersects(
  hailstones: Hail[],
  hailIndex1: number,
  hailIndex2: number
): boolean {
  const hail1 = hailstones[hailIndex1];
  const hail2 = hailstones[hailIndex2];
  const [x, y] = getIntersectionPoint(hail1, hail2);

  const inArea = x >= MIN && x <= MAX && y >= MIN && y <= MAX;
  if (inArea && crossesInTheFuture(hail1, hail2, x, y)) {
    return true;
  }

  return false;
}

function crossesInTheFuture(hail1: Hail, hail2: Hail, x: number, y: number) {
  const xValidFor1 = x > hail1.x ? hail1.vx > 0 : hail1.vx <= 0;
  const yValidFor1 = y > hail1.y ? hail1.vy > 0 : hail1.vy <= 0;
  const xValidFor2 = x > hail2.x ? hail2.vx > 0 : hail2.vx <= 0;
  const yValidFor2 = y > hail2.y ? hail2.vy > 0 : hail2.vy <= 0;
  return xValidFor1 && yValidFor1 && xValidFor2 && yValidFor2;
}

function getIntersectionPoint(hail1: Hail, hail2: Hail): [number, number] {
  // ax+by+c=0
  const a1 = -hail1.vy;
  const b1 = hail1.vx;
  const c1 = hail1.x * hail1.vy - hail1.y * hail1.vx;
  const a2 = -hail2.vy;
  const b2 = hail2.vx;
  const c2 = hail2.x * hail2.vy - hail2.y * hail2.vx;

  const x = (b1 * c2 - b2 * c1) / (a1 * b2 - a2 * b1);
  const y = (c1 * a2 - c2 * a1) / (a1 * b2 - a2 * b1);

  return [x, y];
}

// reframe the rock as standing still and the hailstones moving towards it (hailstone velocity - rock velocity)
function part2(hailstones: Hail[]) {
  // guess X and Y velocities
  for (let rock_vx = -ROCK_V_BOUND; rock_vx <= ROCK_V_BOUND; rock_vx++) {
    for (let rock_vy = -ROCK_V_BOUND; rock_vy <= ROCK_V_BOUND; rock_vy++) {
      adjustVelocities(hailstones, -rock_vx, -rock_vy);
      if (allHeilstonesIntersectAtSamePointInFuture(hailstones)) {
        const [x, y] = getIntersectionPoint(hailstones[0], hailstones[1]);
        const [z, rock_vz] = getZ(hailstones, x, y);
        if (z !== null) {
          console.log(rock_vx + " + " + rock_vy + " + " + rock_vz);
          console.log(x + " + " + y + " + " + z);
          console.log(x + y + z);
          return;
        }
      }
      adjustVelocities(hailstones, rock_vx, rock_vy);
    }
  }
}

// find Z cord that is the same for all trajectories at XY
function getZ(hailstones: Hail[], x: number, y: number): [number, number] {
  // x0 + vx * t = x
  // y0 + vy * t = y
  // z0 + vz * t = z
  // t = (x - x0) / vx = (y - y0) / vy

  // guess Z velocity
  for (let rock_vz = -ROCK_V_BOUND; rock_vz <= ROCK_V_BOUND; rock_vz++) {
    var previousZ = null;
    for (let hail of hailstones) {
      const updatedHeil_vz = hail.vz - rock_vz;
      const t = (x - hail.x) / hail.vx;
      var z = hail.z + updatedHeil_vz * t;
      if (previousZ === null) {
        previousZ = z;
      }
      if (previousZ !== z) {
        previousZ = null;
        break;
      }
    }

    if (previousZ !== null) {
      return [previousZ, rock_vz];
    }
  }
}

function allHeilstonesIntersectAtSamePointInFuture(hailstones: Hail[]) {
  var previousX = null,
    previousY = null;
  const hail1 = hailstones[0];
  for (let j = 1; j < hailstones.length; j++) {
    const hail2 = hailstones[j];
    const [x, y] = getIntersectionPoint(hail1, hail2);
    if (previousX === null) {
      if (!crossesInTheFuture(hail1, hail2, x, y)) {
        return false;
      }
      previousX = x;
      previousY = y;
    }

    if (Math.abs(x - previousX) > 5 || Math.abs(y - previousY) > 5) {
      return false;
    }
  }
  return true;
}

function adjustVelocities(
  hailstones: Hail[],
  vxDelta: number,
  vyDelta: number
) {
  hailstones.forEach((hailstone) => {
    hailstone.vx += vxDelta;
    hailstone.vy += vyDelta;
  });
}

function parseHail(lines: String[]): Hail[] {
  return lines.map((line) => {
    const [x, y, z, vx, vy, vz] = line.split(/[\s,@]+/).map((v) => parseInt(v));
    return { x: x, y: y, z: z, vx: vx, vy: vy, vz: vz };
  });
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
