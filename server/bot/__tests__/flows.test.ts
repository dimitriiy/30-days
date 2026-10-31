import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import type TelegramBot from "node-telegram-bot-api";

import { dailyQuotes } from "../content";
import { quoteTime } from "../domain";
import { deliverDue, type SchedulerServices } from "../scheduler";
import { createSubscriberStore } from "../store";
import { BOT_COMMANDS, configureBotMenu, registerBotHandlers, type BotServices } from "../telegram";

type Sent = { chatId: number; text: string; options?: unknown };

class FakeBot {
  handlers = new Map<string, (value: never) => Promise<unknown>>();
  sent: Sent[] = [];
  edited: Array<{ text: string; options: unknown }> = [];
  answers: string[] = [];
  failText?: string;

  on(event: string, handler: (value: never) => Promise<unknown>): this {
    this.handlers.set(event, handler);
    return this;
  }

  async sendMessage(chatId: number, text: string, options?: unknown): Promise<object> {
    if (this.failText && text.includes(this.failText)) throw new Error("Telegram unavailable");
    this.sent.push({ chatId, text, options });
    return {};
  }

  async answerCallbackQuery(id: string): Promise<boolean> {
    this.answers.push(id);
    return true;
  }

  async editMessageText(text: string, options: unknown): Promise<object> {
    this.edited.push({ text, options });
    return {};
  }

  async message(text: string, chatId = 1): Promise<void> {
    const handler = this.handlers.get("message");
    assert.ok(handler);
    await handler({ text, chat: { id: chatId, type: "private" } } as never);
  }

  async callback(data: string, chatId = 1): Promise<void> {
    const handler = this.handlers.get("callback_query");
    assert.ok(handler);
    await handler({ id: "callback-id", data, message: { chat: { id: chatId, type: "private" }, message_id: 7 } } as never);
  }
}

async function setup(t: { after: (fn: () => Promise<void>) => void }) {
  const folder = await mkdtemp(path.join(tmpdir(), "mark-bot-test-"));
  t.after(() => rm(folder, { recursive: true, force: true }));
  const filePath = path.join(folder, "bot-data.json");
  const store = createSubscriberStore(filePath);
  const bot = new FakeBot();
  let now = new Date("2026-06-01T05:00:00Z");
  const services: BotServices = { ...store, now: () => now, newId: () => "abc123" };
  registerBotHandlers(bot as unknown as TelegramBot, services);
  const scheduler: SchedulerServices = {
    ...store,
    dailyQuotes: async () => ["Дневная цитата"],
    morningMessage: async () => "Утренний настрой",
  };
  return { bot, store, scheduler, filePath, setNow: (value: string) => { now = new Date(value); } };
}

test("onboarding defaults to Moscow, validates time, and persists the subscription", async (t) => {
  const { bot, store, filePath } = await setup(t);
  await bot.message("/start");
  assert.equal((await store.readSubscribers())[0].awaiting, "morning");
  assert.equal((await store.readSubscribers())[0].timeZone, "Europe/Moscow");
  await bot.message("/timezone");
  await bot.message("Invalid/Zone");
  assert.equal((await store.readSubscribers())[0].awaiting, "timezone");
  await bot.callback("tz:Europe/Moscow");
  assert.equal((await store.readSubscribers())[0].timeZone, "Europe/Moscow");
  await bot.message("25:00");
  assert.equal((await store.readSubscribers())[0].active, false);
  await bot.message("08:00");
  const user = (await store.readSubscribers())[0];
  assert.equal(user.active, true);
  assert.equal(user.morningTime, "08:00");
  assert.equal(user.awaiting, undefined);
  const reloaded = createSubscriberStore(filePath);
  assert.equal((await reloaded.readSubscribers())[0].morningTime, "08:00");
});

test("/quote sends a random real quote immediately without changing the daily schedule", async (t) => {
  const { bot, store } = await setup(t);
  await bot.message("/quote");
  const message = bot.sent.at(-1)!.text;
  assert.ok(message.startsWith("💭 Мысль дня\n\n"));
  assert.ok((await dailyQuotes()).includes(message.slice("💭 Мысль дня\n\n".length)));
  assert.deepEqual(await store.readSubscribers(), []);
});

test("native Telegram menu exposes the bot commands in private chats", async () => {
  let commands: typeof BOT_COMMANDS = [];
  let scope: unknown;
  let menuButton: unknown;
  const bot = {
    setMyCommands: async (items: typeof BOT_COMMANDS, options: unknown) => {
      commands = items;
      scope = options;
      return true;
    },
    setChatMenuButton: async (options: unknown) => {
      menuButton = options;
      return true;
    },
  } as unknown as TelegramBot;
  await configureBotMenu(bot);
  assert.deepEqual(commands, BOT_COMMANDS);
  assert.deepEqual(commands.map(({ command }) => command), ["start", "quote", "habit", "progress", "habits", "time", "timezone", "stop", "help"]);
  assert.deepEqual(scope, { scope: { type: "all_private_chats" } });
  assert.deepEqual(menuButton, { menu_button: { type: "commands" } });
});

test("stored subscribers without a timezone are migrated to the Moscow default", async (t) => {
  const folder = await mkdtemp(path.join(tmpdir(), "mark-bot-migration-"));
  t.after(() => rm(folder, { recursive: true, force: true }));
  const filePath = path.join(folder, "bot-data.json");
  await writeFile(filePath, JSON.stringify({ subscribers: [{ chatId: 5, active: true, morningTime: "08:00", habits: [] }] }));
  const store = createSubscriberStore(filePath);
  assert.equal((await store.readSubscribers())[0].timeZone, "Europe/Moscow");
  const reloaded = createSubscriberStore(filePath);
  assert.equal((await reloaded.readSubscribers())[0].timeZone, "Europe/Moscow");
});

test("habit creation validates order, daily check can be corrected, progress is saved", async (t) => {
  const { bot, store, setNow } = await setup(t);
  await bot.message("/start");
  await bot.message("08:00");
  await bot.message("/habit");
  await bot.message("Читать");
  await bot.message("10:00");
  await bot.message("09:00");
  assert.equal((await store.readSubscribers())[0].awaiting, "habit-check");
  await bot.message("21:00");
  const habit = (await store.readSubscribers())[0].habits[0];
  assert.equal(habit.startDate, "2026-06-01");
  assert.equal(habit.checkTime, "21:00");
  setNow("2026-06-01T18:00:00Z");
  await bot.callback(`habit:${habit.id}:2026-06-01:no`);
  assert.equal((await store.readSubscribers())[0].habits[0].results["2026-06-01"], false);
  await bot.callback(`habit:${habit.id}:2026-06-01:yes`);
  assert.equal((await store.readSubscribers())[0].habits[0].results["2026-06-01"], true);
  assert.ok(bot.edited.at(-1)?.text.includes("☑️ Выполнено"));
  assert.ok(bot.edited.at(-1)?.options && JSON.stringify(bot.edited.at(-1)?.options).includes("callback_data"));
  await bot.message("/progress");
  assert.match(bot.sent.at(-1)!.text, /Выполнено: 1/);
  assert.match(bot.sent.at(-1)!.text, /01–10  ☑️/);
  assert.match(bot.sent.at(-1)!.text, /▫️ — будущие дни/);
  await bot.message("/stop");
  assert.equal((await store.readSubscribers())[0].active, false);
});

test("habit title accepts 180 characters and rejects 181", async (t) => {
  const { bot, store } = await setup(t);
  await bot.message("/start");
  await bot.message("08:00");
  await bot.message("/habit");
  assert.match(bot.sent.at(-1)!.text, /до 180 символов/);
  await bot.message("а".repeat(181));
  assert.equal((await store.readSubscribers())[0].awaiting, "habit-title");
  assert.match(bot.sent.at(-1)!.text, /от 1 до 180 символов/);
  await bot.message("а".repeat(180));
  const user = (await store.readSubscribers())[0];
  assert.equal(user.awaiting, "habit-reminder");
  assert.equal(user.draft?.title.length, 180);
});

test("timezone and morning time can change without losing habits", async (t) => {
  const { bot, store } = await setup(t);
  await bot.message("/start");
  await bot.message("08:00");
  await bot.message("/habit");
  await bot.message("Читать");
  await bot.message("10:00");
  await bot.message("21:00");
  await bot.message("/timezone");
  await bot.message("Europe/Berlin");
  await bot.message("/time");
  await bot.message("09:15");
  const user = (await store.readSubscribers())[0];
  assert.equal(user.timeZone, "Europe/Berlin");
  assert.equal(user.morningTime, "09:15");
  assert.equal(user.habits.length, 1);
  assert.equal(user.active, true);
});

test("scheduler sends local morning, daytime quote, habit reminder and check only once", async (t) => {
  const { bot, store, scheduler, filePath } = await setup(t);
  await store.updateSubscriber(1, (user) => {
    user.active = true;
    user.timeZone = "Europe/Moscow";
    user.morningTime = "08:00";
    user.habits = [{ id: "habit-1", title: "Читать", startDate: "2026-06-01", reminderTime: "10:00", checkTime: "21:00", results: {} }];
  });
  await store.updateSubscriber(2, (user) => {
    user.active = true;
    user.timeZone = "Europe/Berlin";
    user.morningTime = "08:00";
  });
  const telegram = bot as unknown as TelegramBot;
  await deliverDue(telegram, new Date("2026-06-01T05:00:00Z"), scheduler);
  const restarted = createSubscriberStore(filePath);
  await deliverDue(telegram, new Date("2026-06-01T05:00:00Z"), { ...scheduler, ...restarted });
  assert.equal(bot.sent.filter((message) => message.text.startsWith("🌅 Утренний настрой") && message.chatId === 1).length, 1);
  assert.equal(bot.sent.filter((message) => message.text.startsWith("🌅 Утренний настрой") && message.chatId === 2).length, 0);
  await deliverDue(telegram, new Date("2026-06-01T06:00:00Z"), scheduler);
  assert.equal(bot.sent.filter((message) => message.text.startsWith("🌅 Утренний настрой") && message.chatId === 2).length, 1);
  await deliverDue(telegram, new Date("2026-06-01T07:00:00Z"), scheduler);
  assert.equal(bot.sent.filter((message) => message.text.startsWith("🔔 Привычка на сегодня") && message.chatId === 1).length, 1);
  const quote = quoteTime(1, "2026-06-01");
  const [hour, minute] = quote.split(":").map(Number);
  await deliverDue(telegram, new Date(Date.UTC(2026, 5, 1, hour - 3, minute)), scheduler);
  assert.equal(bot.sent.filter((message) => message.text === "💭 Мысль дня\n\nДневная цитата" && message.chatId === 1).length, 1);
  await deliverDue(telegram, new Date("2026-06-01T18:00:00Z"), scheduler);
  assert.equal(bot.sent.filter((message) => message.text.startsWith("✅ Время отметить привычку") && message.chatId === 1).length, 1);
  await Promise.all([
    deliverDue(telegram, new Date("2026-06-01T18:00:00Z"), scheduler),
    deliverDue(telegram, new Date("2026-06-01T18:00:00Z"), scheduler),
  ]);
  assert.equal(bot.sent.filter((message) => message.text.startsWith("✅ Время отметить привычку") && message.chatId === 1).length, 1);
});

test("failed morning delivery does not prevent a habit reminder", async (t) => {
  const { bot, store, scheduler } = await setup(t);
  await store.updateSubscriber(1, (user) => {
    user.active = true;
    user.timeZone = "Europe/Moscow";
    user.morningTime = "08:00";
    user.habits = [{ id: "habit-1", title: "Читать", startDate: "2026-06-01", reminderTime: "08:00", checkTime: "21:00", results: {} }];
  });
  bot.failText = "Утренний настрой";
  const originalError = console.error;
  console.error = () => undefined;
  try {
    await deliverDue(bot as unknown as TelegramBot, new Date("2026-06-01T05:00:00Z"), scheduler);
  } finally {
    console.error = originalError;
  }
  assert.equal((await store.readSubscribers())[0].lastMorningDate, undefined);
  assert.equal((await store.readSubscribers())[0].habits[0].lastReminderDate, "2026-06-01");
  assert.ok(bot.sent.some((message) => message.text.startsWith("🔔 Привычка на сегодня")));
  bot.failText = undefined;
  await deliverDue(bot as unknown as TelegramBot, new Date("2026-06-01T05:01:00Z"), scheduler);
  assert.equal((await store.readSubscribers())[0].lastMorningDate, "2026-06-01");
  assert.equal(bot.sent.filter((message) => message.text.startsWith("🌅 Утренний настрой")).length, 1);
});

test("stopped subscriptions and completed 30-day habits receive no reminders", async (t) => {
  const { bot, store, scheduler } = await setup(t);
  await store.updateSubscriber(1, (user) => {
    user.active = true;
    user.timeZone = "Europe/Moscow";
    user.morningTime = "08:00";
    user.habits = [{ id: "habit-1", title: "Читать", startDate: "2026-06-01", reminderTime: "10:00", checkTime: "21:00", results: {} }];
  });
  await deliverDue(bot as unknown as TelegramBot, new Date("2026-07-01T07:00:00Z"), scheduler);
  assert.equal(bot.sent.length, 0);
  await bot.message("/stop");
  bot.sent = [];
  await deliverDue(bot as unknown as TelegramBot, new Date("2026-07-02T05:00:00Z"), scheduler);
  assert.equal(bot.sent.length, 0);
});
