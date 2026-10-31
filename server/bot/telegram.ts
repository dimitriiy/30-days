import { randomUUID } from "node:crypto";
import TelegramBot from "node-telegram-bot-api";

import {
  DEFAULT_TIME_ZONE,
  habitDay,
  isActiveHabit,
  localDateTime,
  nextDate,
  parseTime,
  parseTimeZone,
  progress,
} from "./domain";
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
  "/start — подписаться и выбрать время утреннего сообщения (часовой пояс по умолчанию — Москва)",
  "/timezone — изменить часовой пояс",
  "/time — изменить время утреннего сообщения",
  "/habit — создать привычку на 30 дней",
  "/habits — список привычек и прогресс",
  "/progress — прогресс по всем привычкам",
  "/stop — отключить все уведомления",
  "Все времена указывайте в своём часовом поясе, формат ЧЧ:ММ.",
].join("\n");

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
      `Часовой пояс: ${timeZone}. Во сколько каждый день присылать утренний настрой? Напиши местное время ЧЧ:ММ, например 08:30.`,
    );
  } else {
    await bot.sendMessage(
      chatId,
      `Часовой пояс изменён на ${timeZone}. Все сообщения будут приходить по местному времени.`,
    );
  }
}

function habitListText(
  habits: Awaited<ReturnType<typeof defaultReadSubscribers>>[number]["habits"],
  date: string,
): string {
  if (!habits.length)
    return "Пока нет привычек. Создай первую командой /habit.";
  return habits
    .map((habit) => {
      const stats = progress(habit, date);
      const day = habitDay(habit, date);
      const status =
        day < 1
          ? `начнётся ${habit.startDate}`
          : day > 30
            ? "завершена"
            : `день ${day}/30`;
      return `• ${habit.title} — ${status}\n  Выполнено: ${stats.done}; не выполнено: ${stats.missed}; без ответа: ${stats.unanswered}\n  Напоминание: ${habit.reminderTime}; отметка: ${habit.checkTime}`;
    })
    .join("\n\n");
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
          user.morningTime = undefined;
          user.timeZone ??= DEFAULT_TIME_ZONE;
          user.awaiting = "morning";
          user.draft = undefined;
        });
        await bot.sendMessage(chatId, "Во сколько каждый день присылать утренний настрой? Напиши местное время ЧЧ:ММ, например 08:30. Часовой пояс по умолчанию — Europe/Moscow; изменить его можно командой /timezone.");
        return;
      }
      if (text === "/timezone") {
        await updateSubscriber(chatId, (user) => { user.awaiting = "timezone"; user.draft = undefined; });
        await bot.sendMessage(
          chatId,
          "Выбери свой часовой пояс или напиши его название, например Europe/Berlin. Можно также написать город: Москва, Екатеринбург, Новосибирск и другие.",
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
            "Сначала укажи часовой пояс через /start.",
          );
          return;
        }
        await updateSubscriber(chatId, (current) => {
          current.awaiting = "morning";
          current.draft = undefined;
        });
        await bot.sendMessage(
          chatId,
          `Во сколько присылать утренний настрой? Напиши ЧЧ:ММ по времени ${user.timeZone}.`,
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
          "Уведомления отключены. Чтобы вернуться, напиши /start.",
        );
        return;
      }
      if (text === "/help") {
        await bot.sendMessage(chatId, HELP);
        return;
      }
      if (text === "/habit") {
        const user = (await readSubscribers()).find(
          (item) => item.chatId === chatId,
        );
        if (!user?.active) {
          await bot.sendMessage(chatId, "Сначала подпишись через /start.");
          return;
        }
        await updateSubscriber(chatId, (current) => {
          current.awaiting = "habit-title";
          current.draft = undefined;
        });
        await bot.sendMessage(
          chatId,
          "Как назвать привычку? Напиши короткое название (до 80 символов).",
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
            "Сначала укажи часовой пояс через /start.",
          );
          return;
        }
        await bot.sendMessage(
          chatId,
          habitListText(
            user.habits,
            localDateTime(now(), user.timeZone).date,
          ),
        );
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
            "Не нашёл такой часовой пояс. Выбери кнопку выше или напиши, например, Europe/Berlin или Москва.",
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
            "Нужно время в формате ЧЧ:ММ, например 08:30.",
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
          `Готово. Утренний настрой будет приходить ежедневно в ${time}, а одна цитата — в случайное время с 12:00 до 21:00 по твоему местному времени (${user.timeZone}).\n\nСоздать привычку: /habit`,
        );
        return;
      }
      if (user?.awaiting === "habit-title") {
        if (!text || text.length > 80) {
          await bot.sendMessage(
            chatId,
            "Название должно быть от 1 до 80 символов.",
          );
          return;
        }
        await updateSubscriber(chatId, (current) => {
          current.draft = { title: text };
          current.awaiting = "habit-reminder";
        });
        await bot.sendMessage(
          chatId,
          `Во сколько напоминать о привычке? Напиши ЧЧ:ММ по твоему местному времени (${user.timeZone}).`,
        );
        return;
      }
      if (user?.awaiting === "habit-reminder") {
        const time = parseTime(text);
        if (!time) {
          await bot.sendMessage(
            chatId,
            "Нужно местное время ЧЧ:ММ, например 12:00.",
          );
          return;
        }
        await updateSubscriber(chatId, (current) => {
          if (current.draft) current.draft.reminderTime = time;
          current.awaiting = "habit-check";
        });
        await bot.sendMessage(
          chatId,
          "Во сколько спрашивать, выполнена ли привычка? Укажи местное время позже напоминания, ЧЧ:ММ.",
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
            "Время отметки должно быть позже напоминания в тот же день. Напиши ЧЧ:ММ.",
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
          `Привычка «${title}» создана на 30 дней с ${startDate}. Напоминание: ${user.draft.reminderTime}; отметка: ${time}. Прогресс: /progress`,
        );
        return;
      }
      await bot.sendMessage(chatId, HELP);
    })().catch((error) => console.error("bot message failed:", error));
  });

  bot.on("callback_query", (query) => {
    return (async () => {
      const chatId = query.message?.chat.id;
      if (query.data?.startsWith("tz:") && chatId) {
        const user = (await readSubscribers()).find(
          (item) => item.chatId === chatId,
        );
        if (user?.awaiting !== "timezone") {
          await bot.answerCallbackQuery(query.id, {
            text: "Сначала используй /timezone.",
          });
          return;
        }
        const timeZone = parseTimeZone(query.data.slice(3));
        if (!timeZone) {
          await bot.answerCallbackQuery(query.id, {
            text: "Неверный часовой пояс.",
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
          text: "Эта отметка недоступна.",
        });
        return;
      }
      await updateSubscriber(chatId, (current) => {
        const target = current.habits.find((item) => item.id === id);
        if (target) target.results[date] = value === "yes";
      });
      await bot.answerCallbackQuery(query.id, {
        text: value === "yes" ? "Выполнение записано" : "Пропуск записан",
      });
      if (query.message) {
        await bot.editMessageText(
          `${habit.title}: ${value === "yes" ? "выполнено ✅" : "не выполнено ❌"} (${date})`,
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
  return bot;
}
