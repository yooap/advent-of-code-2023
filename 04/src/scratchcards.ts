import { createReadStream } from "fs";
import { createInterface } from "readline";
import { once } from "events";

async function main() {
  const lines = await readFile();
  const cards: Card[] = parseCards(lines);
  part1(cards);
  part2(cards);
}

class Card {
  myNumbers: number[];
  winningNumbers: number[];
}

function part1(cards: Card[]) {
  const sum = cards
    .map(
      (card) =>
        card.winningNumbers.filter((winningNumber) =>
          card.myNumbers.includes(winningNumber)
        ).length
    )
    .filter((count) => count > 0)
    .reduce((sum, count) => sum + Math.pow(2, count - 1), 0);
  console.log(sum);
}
function part2(cards: Card[]) {
  const countPerCard = cards.map(() => 1);
  var sum = 0;
  cards.forEach((card, idx) => {
    var count = card.winningNumbers.filter((winningNumber) =>
      card.myNumbers.includes(winningNumber)
    ).length;
    while (count > 0) {
      countPerCard[idx + count] = countPerCard[idx + count] + countPerCard[idx];
      count--;
    }

    sum += countPerCard[idx];
  });
  console.log(sum);
}

function parseCards(lines: String[]) {
  const cards: Card[] = [];
  lines.forEach((line) => {
    const [winningNumbers, myNumbers] = line
      .split(": ")[1]
      .split(" | ")
      .map((numbers) => {
        return numbers
          .trim()
          .split(/\s+/)
          .map((n) => parseInt(n));
      });

    const card: Card = {
      winningNumbers: winningNumbers,
      myNumbers: myNumbers,
    };
    return cards.push(card);
  });
  return cards;
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
