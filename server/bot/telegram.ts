import { randomInt, randomUUID } from "node:crypto";
import TelegramBot from "node-telegram-bot-api";

import { dailyQuotes } from "./content";
import {
  DEFAULT_TIME_ZONE,
  isActiveHabit,
  localDateTime,
  nextDate,
  parseTime,
  parseTimeZone,
} from "./domain";
import { habitProgress, habitResult, quoteNotification } from "./messages";
import { readSubscribers as defaultReadSubscribers, updateSubscriber as defaultUpdateSubscriber } from "./store";

export interface BotServices {
  readSubscribers: typeof defaultReadSubscribers;
  updateSubscriber: typeof defaultUpdateSubscriber;
  now: () => Date;
  newId: () => string;
}

const defaultServices: BotServices = {
  readSubscribers: defaultReadSubscribers,
  updateSubscriber: defaultUpdateSubscriber,
  now: () => new Date(),
  newId: randomUUID,
};

const HELP = [
  "🤖 Что умеет бот",
  "",
  "🌅 /start — настроить утреннее сообщение",
  "💭 /quote — получить случайную цитату сейчас",
  "🎯 /habit — создать привычку на 30 дней",
  "📊 /progress — посмотреть прогресс",
  "🗂 /habits — посмотреть привычки",
  "🕒 /time — изменить время утреннего сообщения",
  "📍 /timezone — изменить часовой пояс",
  "🔕 /stop — отключить уведомления",
  "",
  "Время указывай в формате ЧЧ:ММ по своему часовому поясу.",
].join("\n");

const MAX_HABIT_TITLE_LENGTH = 180;

export const BOT_COMMANDS: Array<{ command: string; description: string }> = [
  { command: "start", description: "Настроить утренний настрой" },
  { command: "quote", description: "Получить случайную цитату" },
  { command: "habit", description: "Создать привычку" },
  { command: "progress", description: "Посмотреть прогресс" },
  { command: "habits", description: "Мои привычки" },
  { command: "time", description: "Изменить время" },
  { command: "timezone", description: "Изменить часовой пояс" },
  { command: "stop", description: "Отключить уведомления" },
  { command: "help", description: "Помощь" },
];

export async function configureBotMenu(bot: TelegramBot): Promise<void> {
  await bot.setMyCommands(BOT_COMMANDS, { scope: { type: "all_private_chats" } });
  await bot.setChatMenuButton({ menu_button: { type: "commands" } });
}

const TIME_ZONE_KEYBOARD = {
  inline_keyboard: [
    [
      { text: "Москва", callback_data: "tz:Europe/Moscow" },
      { text: "Калининград", callback_data: "tz:Europe/Kaliningrad" },
    ],
    [
      { text: "Екатеринбург", callback_data: "tz:Asia/Yekaterinburg" },
      { text: "Новосибирск", callback_data: "tz:Asia/Novosibirsk" },
    ],
    [
      { text: "Красноярск", callback_data: "tz:Asia/Krasnoyarsk" },
      { text: "Иркутск", callback_data: "tz:Asia/Irkutsk" },
    ],
    [{ text: "Владивосток", callback_data: "tz:Asia/Vladivostok" }],
  ],
};

async function saveTimeZone(
  bot: TelegramBot,
  chatId: number,
  timeZone: string,
  updateSubscriber: BotServices["updateSubscriber"],
): Promise<void> {
  const user = await updateSubscriber(chatId, (current) => {
    current.timeZone = timeZone;
    current.awaiting = current.morningTime ? undefined : "morning";
  });
  if (user.awaiting === "morning") {
    await bot.sendMessage(
      chatId,
      `📍 Часовой пояс: ${timeZone}\n\n🌅 Во сколько присылать утренний настрой каждый день?\nНапиши местное время в формате ЧЧ:ММ, например 08:30.`,
    );
  } else {
    await bot.sendMessage(
      chatId,
      `✅ Часовой пояс изменён: ${timeZone}\n\nВсе сообщения будут приходить по местному времени.`,
    );
  }
}

export function registerBotHandlers(bot: TelegramBot, services: BotServices = defaultServices): void {
  const { readSubscribers, updateSubscriber, now, newId } = services;

  bot.on("message", (message) => {
    if (!message.text || message.chat.type !== "private") return;
    return (async () => {
      const chatId = message.chat.id;
      const text = message.text!.trim();
      if (text === "/start" || text === "/subscribe") {
        await updateSubscriber(chatId, (user) => {
          user.active = false;
          user.firstName = message.from?.first_name?.trim() || user.firstName;
          user.morningTime = undefined;
          user.timeZone ??= DEFAULT_TIME_ZONE;
          user.awaiting = "morning";
          user.draft = undefined;
        });
        await bot.sendMessage(chatId, "🌅 Утренний настрой\n\nВо сколько присылать его каждый день?\nНапиши местное время в формате ЧЧ:ММ, например 08:30.\n\n📍 Сейчас часовой пояс — Europe/Moscow. Изменить: /timezone");
        return;
      }
      if (text === "/timezone") {
        await updateSubscriber(chatId, (user) => { user.awaiting = "timezone"; user.draft = undefined; });
        await bot.sendMessage(
          chatId,
          "📍 Твой часовой пояс\n\nВыбери город ниже или напиши название зоны, например Europe/Berlin или Москва.",
          { reply_markup: TIME_ZONE_KEYBOARD },
        );
        return;
      }
      if (text === "/time") {
        const user = (await readSubscribers()).find(
          (item) => item.chatId === chatId,
        );
        if (!user?.timeZone) {
          await bot.sendMessage(
            chatId,
            "📍 Сначала укажи часовой пояс через /start.",
          );
          return;
        }
        await updateSubscriber(chatId, (current) => {
          current.awaiting = "morning";
          current.draft = undefined;
        });
        await bot.sendMessage(
          chatId,
          `🕒 Новое время утреннего настроя\n\nНапиши ЧЧ:ММ по времени ${user.timeZone}.`,
        );
        return;
      }
      if (text === "/stop" || text === "/unsubscribe") {
        await updateSubscriber(chatId, (user) => {
          user.active = false;
          user.awaiting = undefined;
          user.draft = undefined;
        });
        await bot.sendMessage(
          chatId,
          "🔕 Уведомления отключены.\n\nЧтобы вернуться, напиши /start.",
        );
        return;
      }
      if (text === "/help") {
        await bot.sendMessage(chatId, HELP);
        return;
      }
      if (text === "/quote") {
        const quotes = await dailyQuotes();
        if (!quotes.length) {
          await bot.sendMessage(chatId, "⚠️ Цитаты пока недоступны. Попробуй позже.");
          return;
        }
        await bot.sendMessage(chatId, quoteNotification(quotes[randomInt(quotes.length)]));
        return;
      }
      if (text === "/habit") {
        const user = (await readSubscribers()).find(
          (item) => item.chatId === chatId,
        );
        if (!user?.active) {
          await bot.sendMessage(chatId, "🎯 Сначала настрой бота через /start, затем создай привычку.");
          return;
        }
        await updateSubscriber(chatId, (current) => {
          current.awaiting = "habit-title";
          current.draft = undefined;
        });
        await bot.sendMessage(
          chatId,
          `🎯 Новая привычка\n\nКак она называется? Напиши название длиной до ${MAX_HABIT_TITLE_LENGTH} символов.`,
        );
        return;
      }
      if (text === "/habits" || text === "/progress") {
        const user = (await readSubscribers()).find(
          (item) => item.chatId === chatId,
        );
        if (!user?.timeZone) {
          await bot.sendMessage(
            chatId,
            "📍 Сначала укажи часовой пояс через /start.",
          );
          return;
        }
        if (!user.habits.length) {
          await bot.sendMessage(chatId, "📊 Привычек пока нет.\n\nСоздать первую: /habit");
          return;
        }
        const date = localDateTime(now(), user.timeZone).date;
        for (const [index, habit] of user.habits.entries()) {
          const options = index === user.habits.length - 1
            ? { reply_markup: { inline_keyboard: [[{ text: "🗑 Удалить все привычки", callback_data: "habits:delete:ask" }]] } }
            : undefined;
          await bot.sendMessage(chatId, habitProgress(habit, date), options);
        }
        return;
      }
      if (text.startsWith("/")) {
        await bot.sendMessage(chatId, HELP);
        return;
      }
      const user = (await readSubscribers()).find(
        (item) => item.chatId === chatId,
      );
      if (user?.awaiting === "timezone") {
        const timeZone = parseTimeZone(text);
        if (!timeZone) {
          await bot.sendMessage(
            chatId,
            "⚠️ Не нашёл этот часовой пояс.\n\nВыбери кнопку выше или напиши, например, Europe/Berlin или Москва.",
          );
          return;
        }
        await saveTimeZone(bot, chatId, timeZone, updateSubscriber);
        return;
      }
      if (user?.awaiting === "morning") {
        const time = parseTime(text);
        if (!time) {
          await bot.sendMessage(
            chatId,
            "⚠️ Время не распознано.\n\nНапиши ЧЧ:ММ, например 08:30.",
          );
          return;
        }
        await updateSubscriber(chatId, (current) => {
          current.morningTime = time;
          current.active = true;
          current.awaiting = undefined;
          if (localDateTime(now(), current.timeZone ?? DEFAULT_TIME_ZONE).time >= time) {
            current.lastMorningDate = localDateTime(now(), current.timeZone ?? DEFAULT_TIME_ZONE).date;
          }
        });
        await bot.sendMessage(
          chatId,
          `✅ Подписка настроена\n\n🌅 Утренний настрой — каждый день в ${time}\n💭 Цитата — один раз в случайное время с 12:00 до 21:00\n📍 Часовой пояс — ${user.timeZone}\n\n🎯 Создать привычку: /habit`,
        );
        return;
      }
      if (user?.awaiting === "habit-title") {
        if (!text || Array.from(text).length > MAX_HABIT_TITLE_LENGTH) {
          await bot.sendMessage(
            chatId,
            `⚠️ Название должно быть длиной от 1 до ${MAX_HABIT_TITLE_LENGTH} символов.\n\nПопробуй ещё раз.`,
          );
          return;
        }
        await updateSubscriber(chatId, (current) => {
          current.draft = { title: text };
          current.awaiting = "habit-reminder";
        });
        await bot.sendMessage(
          chatId,
          `🔔 Напоминание о привычке\n\nВо сколько напомнить о ней?\nНапиши ЧЧ:ММ по местному времени (${user.timeZone}).`,
        );
        return;
      }
      if (user?.awaiting === "habit-reminder") {
        const time = parseTime(text);
        if (!time) {
          await bot.sendMessage(
            chatId,
            "⚠️ Время не распознано.\n\nНапиши местное время ЧЧ:ММ, например 12:00.",
          );
          return;
        }
        await updateSubscriber(chatId, (current) => {
          if (current.draft) current.draft.reminderTime = time;
          current.awaiting = "habit-check";
        });
        await bot.sendMessage(
          chatId,
          "📝 Отметка результата\n\nВо сколько спросить, выполнил ли ты привычку?\nНапиши ЧЧ:ММ позже времени напоминания.",
        );
        return;
      }
      if (user?.awaiting === "habit-check") {
        const time = parseTime(text);
        if (
          !time ||
          !user.draft?.reminderTime ||
          time <= user.draft.reminderTime
        ) {
          await bot.sendMessage(
            chatId,
            "⚠️ Время отметки должно быть позже напоминания в тот же день.\n\nНапиши другое время в формате ЧЧ:ММ.",
          );
          return;
        }
        const title = user.draft.title;
        const current = localDateTime(now(), user.timeZone!);
        const startDate =
          current.time >= user.draft.reminderTime ? nextDate(current.date) : current.date;
        await updateSubscriber(chatId, (current) => {
          current.habits.push({
            id: newId(),
            title,
            startDate,
            reminderTime: user.draft!.reminderTime!,
            checkTime: time,
            results: {},
          });
          current.awaiting = undefined;
          current.draft = undefined;
        });
        await bot.sendMessage(
          chatId,
          `✅ Привычка создана\n\n🎯 ${title}\n\n📅 30 дней с ${startDate}\n\n🔔 Напоминание — ${user.draft.reminderTime}\n\n📝 Отметка результата — ${time}\n\nПосмотреть прогресс: /progress`,
        );
        return;
      }
      await bot.sendMessage(chatId, HELP);
    })().catch((error) => console.error("bot message failed:", error));
  });

  bot.on("callback_query", (query) => {
    return (async () => {
      const chatId = query.message?.chat.id;
      if (query.data?.startsWith("habits:delete:") && chatId) {
        const [action, token] = query.data.slice("habits:delete:".length).split(":");
        const user = (await readSubscribers()).find((item) => item.chatId === chatId);
        if (action === "ask") {
          if (!user?.habits.length) {
            await bot.answerCallbackQuery(query.id, { text: "Привычек уже нет." });
            return;
          }
          const confirmationToken = newId();
          await updateSubscriber(chatId, (current) => {
            current.pendingHabitDeletion = {
              ids: current.habits.map((habit) => habit.id),
              requestedAt: now().toISOString(),
              token: confirmationToken,
            };
          });
          await bot.answerCallbackQuery(query.id);
          await bot.sendMessage(chatId, `⚠️ Удалить все привычки (${user.habits.length})?\n\nОтметки прогресса тоже будут удалены.`, {
            reply_markup: { inline_keyboard: [[
              { text: "🗑 Да, удалить", callback_data: `habits:delete:confirm:${confirmationToken}` },
              { text: "Отмена", callback_data: `habits:delete:cancel:${confirmationToken}` },
            ]] },
          });
          return;
        }
        const pending = user?.pendingHabitDeletion;
        const elapsed = pending ? now().getTime() - Date.parse(pending.requestedAt) : Infinity;
        if (!pending || pending.token !== token || elapsed < 0 || elapsed > 10 * 60_000) {
          await bot.answerCallbackQuery(query.id, { text: "Подтверждение устарело. Открой /habits ещё раз." });
          return;
        }
        if (action !== "confirm" && action !== "cancel") return;
        let count = 0;
        let applied = false;
        await updateSubscriber(chatId, (current) => {
          if (current.pendingHabitDeletion?.token !== token) return;
          applied = true;
          if (action === "confirm") {
            count = current.habits.filter((habit) => pending.ids.includes(habit.id)).length;
            current.habits = current.habits.filter((habit) => !pending.ids.includes(habit.id));
          }
          current.pendingHabitDeletion = undefined;
        });
        if (!applied) {
          await bot.answerCallbackQuery(query.id, { text: "Подтверждение уже использовано." });
          return;
        }
        await bot.answerCallbackQuery(query.id);
        await bot.editMessageText(action === "confirm" ? `🗑 Удалено привычек: ${count}.\n\nСоздать новую: /habit` : "✅ Удаление отменено. Привычки сохранены.", {
          chat_id: chatId,
          message_id: query.message!.message_id,
        });
        return;
      }
      if (query.data?.startsWith("tz:") && chatId) {
        const user = (await readSubscribers()).find(
          (item) => item.chatId === chatId,
        );
        if (user?.awaiting !== "timezone") {
          await bot.answerCallbackQuery(query.id, {
            text: "📍 Сначала используй /timezone.",
          });
          return;
        }
        const timeZone = parseTimeZone(query.data.slice(3));
        if (!timeZone) {
          await bot.answerCallbackQuery(query.id, {
            text: "⚠️ Неверный часовой пояс.",
          });
          return;
        }
        await bot.answerCallbackQuery(query.id);
        await saveTimeZone(bot, chatId, timeZone, updateSubscriber);
        return;
      }
      const match = /^habit:([a-f0-9-]+):(\d{4}-\d{2}-\d{2}):(yes|no)$/.exec(
        query.data ?? "",
      );
      if (!match || !chatId) return;
      const [, id, date, value] = match;
      const user = (await readSubscribers()).find(
        (item) => item.chatId === chatId,
      );
      const habit = user?.habits.find((item) => item.id === id);
      if (
        !habit ||
        !user?.timeZone ||
        !isActiveHabit(habit, date) ||
        date > localDateTime(now(), user.timeZone).date
      ) {
        await bot.answerCallbackQuery(query.id, {
          text: "⚠️ Эта отметка недоступна.",
        });
        return;
      }
      await updateSubscriber(chatId, (current) => {
        const target = current.habits.find((item) => item.id === id);
        if (target) target.results[date] = value === "yes";
      });
      await bot.answerCallbackQuery(query.id, {
        text: value === "yes" ? "☑️ Выполнение записано" : "❌ Пропуск записан",
      });
      if (query.message) {
        await bot.editMessageText(
          habitResult(habit, date, value === "yes"),
          {
            chat_id: chatId,
            message_id: query.message.message_id,
            reply_markup: {
              inline_keyboard: [[
                { text: "✅ Выполнил", callback_data: `habit:${id}:${date}:yes` },
                { text: "❌ Не выполнил", callback_data: `habit:${id}:${date}:no` },
              ]],
            },
          },
        );
      }
    })().catch((error) => console.error("habit callback failed:", error));
  });
  bot.on("polling_error", (error) =>
    console.error("telegram polling error:", error),
  );
}

export async function startBot(): Promise<TelegramBot> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN not set");
  const bot = new TelegramBot(token, { polling: true });
  registerBotHandlers(bot);
  await configureBotMenu(bot).catch((error) => console.error("bot menu setup failed:", error));
  return bot;
}
