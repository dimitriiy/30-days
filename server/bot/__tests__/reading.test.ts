import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import type TelegramBot from "node-telegram-bot-api";

import type { ReadingDose } from "../domain";
import { createSubscriberStore } from "../store";
import { registerBotHandlers, type BotServices } from "../telegram";

import { FakeBot } from "./fake-bot";

const DOSES: ReadingDose[] = [
  { book: 1, from: 1, to: 2, text: "1. Первая мысль.\n\n2. Вторая мысль." },
  { book: 1, from: 3, to: 3, text: "3. Третья мысль." },
  { book: 2, from: 1, to: 1, text: "1. Новая книга." },
];

async function setup(t: { after: (fn: () => Promise<void>) => void }, doses: ReadingDose[] = DOSES) {
  const folder = await mkdtemp(path.join(tmpdir(), "mark-read-test-"));
  t.after(() => rm(folder, { recursive: true, force: true }));
  const store = createSubscriberStore(path.join(folder, "bot-data.json"));
  const bot = new FakeBot();
  const services: BotServices = {
    ...store,
    readingDoses: async () => doses,
    now: () => new Date("2026-06-01T05:00:00Z"),
    newId: () => "id",
  };
  registerBotHandlers(bot as unknown as TelegramBot, services);
  return { bot, store };
}

function buttons(bot: FakeBot): Array<{ text: string; callback_data: string }> {
  const options = bot.sent.at(-1)?.options as { reply_markup: { inline_keyboard: Array<Array<{ text: string; callback_data: string }>> } };
  return options.reply_markup.inline_keyboard[0];
}

async function readOf(store: ReturnType<typeof createSubscriberStore>): Promise<number> {
  return (await store.readSubscribers()).find((user) => user.chatId === 1)?.readDoses ?? 0;
}

test("/read sends the next unread dose with navigation buttons and stores progress", async (t) => {
  const { bot, store } = await setup(t);
  await bot.message("/read");
  assert.equal(bot.sent.at(-1)?.text, "📖 «Наедине с собой»\nКнига I, §1–2 · доза 1/3\n\n1. Первая мысль.\n\n2. Вторая мысль.");
  assert.deepEqual(buttons(bot), [
    { text: "⏮ Назад", callback_data: "read:prev:1" },
    { text: "💊 Доза", callback_data: "read:dose" },
    { text: "⏭ Вперёд", callback_data: "read:next:1" },
  ]);
  assert.equal(await readOf(store), 1);
  await bot.message("/read");
  assert.match(bot.sent.at(-1)!.text, /§3 · доза 2\/3/);
  assert.equal(await readOf(store), 2);
});

test("back button rewinds without changing progress and guards the start of the book", async (t) => {
  const { bot, store } = await setup(t);
  await bot.message("/read");
  await bot.message("/read");
  bot.sent = [];
  await bot.callback("read:prev:2");
  assert.match(bot.sent.at(-1)!.text, /доза 1\/3/);
  assert.equal(buttons(bot)[0].callback_data, "read:prev:1");
  assert.equal(await readOf(store), 2);
  await bot.callback("read:prev:1");
  assert.equal(bot.sent.length, 1);
  assert.equal(bot.answers.at(-1), "🏛 Это уже начало книги.");
  assert.equal(await readOf(store), 2);
});

test("forward and dose buttons advance and count progress", async (t) => {
  const { bot, store } = await setup(t);
  await bot.message("/read");
  await bot.callback("read:next:1");
  assert.match(bot.sent.at(-1)!.text, /доза 2\/3/);
  assert.equal(await readOf(store), 2);
  await bot.callback("read:dose");
  assert.match(bot.sent.at(-1)!.text, /Книга II, §1 · доза 3\/3/);
  assert.equal(await readOf(store), 3);
});

test("finished book responds with the finale and restarts from the first dose", async (t) => {
  const { bot, store } = await setup(t);
  await bot.message("/read");
  await bot.message("/read");
  await bot.message("/read");
  bot.sent = [];
  await bot.message("/read");
  assert.match(bot.sent.at(-1)!.text, /дочитана/);
  assert.deepEqual(buttons(bot), [{ text: "📖 Начать заново", callback_data: "read:restart" }]);
  await bot.callback("read:restart");
  assert.match(bot.sent.at(-1)!.text, /доза 1\/3/);
  assert.equal(await readOf(store), 1);
});

test("forward from the last dose leads to the finale", async (t) => {
  const { bot, store } = await setup(t);
  await bot.message("/read");
  await bot.callback("read:next:1");
  await bot.callback("read:next:2");
  bot.sent = [];
  await bot.callback("read:next:3");
  assert.match(bot.sent.at(-1)!.text, /дочитана/);
  assert.equal(await readOf(store), 3);
});

test("each chat keeps its own reading progress", async (t) => {
  const { bot, store } = await setup(t);
  await bot.message("/read", 1);
  await bot.message("/read", 1);
  await bot.message("/read", 2);
  const users = await store.readSubscribers();
  assert.equal(users.find((user) => user.chatId === 1)?.readDoses, 2);
  assert.equal(users.find((user) => user.chatId === 2)?.readDoses, 1);
  bot.sent = [];
  await bot.callback("read:dose", 2);
  assert.match(bot.sent.at(-1)!.text, /доза 2\/3/);
  assert.equal((await store.readSubscribers()).find((user) => user.chatId === 2)?.readDoses, 2);
  assert.equal((await store.readSubscribers()).find((user) => user.chatId === 1)?.readDoses, 2);
});

test("a long dose is split into parts with buttons only on the last", async (t) => {
  const long = "Достаточно длинная мысль стоика о смерти. ".repeat(120).trim();
  const doses: ReadingDose[] = [{ book: 1, from: 1, to: 1, text: long }];
  const { bot } = await setup(t, doses);
  await bot.message("/read");
  assert.ok(bot.sent.length > 1);
  assert.ok(bot.sent.every((part) => part.text.length <= 3900));
  assert.ok(bot.sent.slice(0, -1).every((part) => part.options === undefined));
  assert.ok(bot.sent.at(-1)?.options !== undefined);
});
