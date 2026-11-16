import assert from "node:assert/strict";
import test from "node:test";

import { dailyQuotes, morningMessage, readingDoses } from "../content";

test("real message files are available and fit Telegram's text limit", async () => {
  const morning = await morningMessage();
  const quotes = await dailyQuotes();
  assert.ok(morning.startsWith("Сегодня я встречу людей"));
  assert.ok(morning.length < 4096);
  assert.ok(quotes.length >= 300);
  assert.equal(new Set(quotes).size, quotes.length);
  assert.ok(quotes.every((quote) => quote.length > 0 && quote.length < 4096));
});

test("reading doses load all book files with metadata from file names", async () => {
  const doses = await readingDoses();
  assert.equal(doses.length, 128);
  assert.ok(doses[0].text.startsWith("1. От Вера"));
  assert.match(doses.at(-1)!.text, /кто отпускает тебя/u);
  assert.ok(doses.every((dose) => dose.from <= dose.to && dose.text.length > 0));
  assert.equal(new Set(doses.map((dose) => dose.text)).size, doses.length);
});
