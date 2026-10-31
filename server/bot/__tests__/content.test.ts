import assert from "node:assert/strict";
import test from "node:test";

import { dailyQuotes, morningMessage } from "../content";

test("real message files are available and fit Telegram's text limit", async () => {
  const morning = await morningMessage();
  const quotes = await dailyQuotes();
  assert.ok(morning.startsWith("Сегодня я встречу людей"));
  assert.ok(morning.length < 4096);
  assert.ok(quotes.length >= 300);
  assert.equal(new Set(quotes).size, quotes.length);
  assert.ok(quotes.every((quote) => quote.length > 0 && quote.length < 4096));
});
