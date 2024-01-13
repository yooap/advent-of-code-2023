import { createReadStream } from "fs";
import { createInterface } from "readline";
import { once } from "events";

async function main() {
  const lines = await readFile();
  const hands: Hand[] = parseHands(lines);
  part1(hands);
  const handsWithJoker: Hand[] = parseHandsWithJoker(lines);
  part2(handsWithJoker);
}

class Hand {
  hand: string;
  bid: number;
  type: number;
}

function parseHands(lines: string[]) {
  return lines.map((line) => {
    const [hand, bid] = line.split(" ");
    return { hand: hand, bid: parseInt(bid), type: determineHandType(hand) };
  });
}

function determineHandType(hand: string): any {
  const splitHand = hand.split("").sort();
  const handSet = new Set(splitHand);

  if (handSet.size === 1) {
    // Five of a kind
    return 6;
  }

  const maxDuplicateCount = Math.max(
    ...splitHand.map(
      (thisCard) => splitHand.filter((card) => card === thisCard).length
    )
  );
  if (handSet.size === 2) {
    if (maxDuplicateCount == 4) {
      // Four of a kind
      return 5;
    } else {
      // Full house
      return 4;
    }
  }

  if (handSet.size === 3) {
    if (maxDuplicateCount == 3) {
      // Three of a kind
      return 3;
    } else {
      // Two pair
      return 2;
    }
  }

  if (handSet.size === 4) {
    // One pair
    return 1;
  } else {
    return 0;
  }
}

function parseHandsWithJoker(lines: string[]) {
  return lines.map((line) => {
    const [hand, bid] = line.split(" ");
    return {
      hand: hand,
      bid: parseInt(bid),
      type: determineHandTypeWithJoker(hand),
    };
  });
}

function determineHandTypeWithJoker(hand: string): any {
  if (hand === "JJJJJ") {
    return 6;
  }

  const splitHand = hand.split("").sort();
  if (!splitHand.includes("J")) {
    return determineHandType(hand);
  }

  const possibleTypes = [...new Set(splitHand)]
    .filter((card) => card !== "J")
    .map((card) => hand.replace(/J/g, card))
    .map((updatedHand) => determineHandType(updatedHand));

  return Math.max(...possibleTypes);
}

function part1(hands: Hand[]) {
  console.log(calculateTotaWinnings(hands, false));
}

function calculateTotaWinnings(hands: Hand[], jForJoker: boolean) {
  return hands
    .sort((hand1, hand2) => {
      var diff = hand1.type - hand2.type;
      if (diff !== 0) {
        return diff;
      }

      for (let i = 0; i < 5; i++) {
        diff =
          getCardValue(hand1.hand[i], jForJoker) -
          getCardValue(hand2.hand[i], jForJoker);
        if (diff !== 0) {
          return diff;
        }
      }
    })
    .map((hand, i) => hand.bid * (i + 1))
    .reduce((sum, bid) => sum + bid, 0);
}

function part2(hands: Hand[]) {
  console.log(calculateTotaWinnings(hands, true));
}

function getCardValue(card: string, jForJoker: boolean) {
  switch (card) {
    case "A":
      return 14;
    case "K":
      return 13;
    case "Q":
      return 12;
    case "J":
      return jForJoker ? 1 : 11;
    case "T":
      return 10;
    default:
      return parseInt(card);
  }
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
