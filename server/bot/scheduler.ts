import cron from "node-cron";
import type TelegramBot from "node-telegram-bot-api";

import { backupDatabase } from "../application/backup";

import { dailyQuotes as defaultDailyQuotes, morningMessage as defaultMorningMessage } from "./content";
import { dailyIndex, dueNotifications, localDateTime } from "./domain";
import { habitCheck, habitReminder, morningNotification, quoteNotification } from "./messages";
import { readSubscribers as defaultReadSubscribers, updateSubscriber as defaultUpdateSubscriber } from "./store";

export interface SchedulerServices {
  readSubscribers: typeof defaultReadSubscribers;
  updateSubscriber: typeof defaultUpdateSubscriber;
  dailyQuotes: typeof defaultDailyQuotes;
  morningMessage: typeof defaultMorningMessage;
}

const defaultServices: SchedulerServices = {
  readSubscribers: defaultReadSubscribers,
  updateSubscriber: defaultUpdateSubscriber,
  dailyQuotes: defaultDailyQuotes,
  morningMessage: defaultMorningMessage,
};

async function attempt(chatId: number, send: () => Promise<void>): Promise<void> {
  try {
    await send();
  } catch (error) {
    console.error(`delivery to ${chatId} failed:`, error);
  }
}

let deliveryQueue = Promise.resolve();

export function deliverDue(bot: TelegramBot, now = new Date(), services: SchedulerServices = defaultServices): Promise<void> {
  const operation = deliveryQueue.then(async () => {
    const subscribers = await services.readSubscribers();
    const quotes = await services.dailyQuotes().catch((error) => {
      console.error("loading daily quotes failed:", error);
      return [];
    });
    for (const subscriber of subscribers) {
      if (!subscriber.active || !subscriber.timeZone) continue;
      const chatId = subscriber.chatId;
      try {
        const { date, time } = localDateTime(now, subscriber.timeZone);
        const previous = localDateTime(new Date(now.getTime() - 60_000), subscriber.timeZone);
        const due = dueNotifications(subscriber, date, time, previous.date === date ? previous.time : undefined);
        if (due.morning) {
          await attempt(chatId, async () => {
            let firstName = subscriber.firstName;
            if (!firstName) {
              try {
                firstName = (await bot.getChat(chatId)).first_name?.trim();
              } catch {
                // A profile lookup must not prevent the morning message.
              }
            }
            await bot.sendMessage(chatId, morningNotification(await services.morningMessage(), firstName));
            await services.updateSubscriber(chatId, (user) => {
              user.lastMorningDate = date;
              if (firstName) user.firstName = firstName;
            });
          });
        }
        if (due.quote && quotes.length) {
          await attempt(chatId, async () => {
            await bot.sendMessage(chatId, quoteNotification(quotes[dailyIndex(chatId, date, quotes.length, "quote")]));
            await services.updateSubscriber(chatId, (user) => { user.lastQuoteDate = date; });
          });
        }
        for (const habit of subscriber.habits) {
          if (due.reminders.includes(habit.id)) {
            await attempt(chatId, async () => {
              await bot.sendMessage(chatId, habitReminder(habit));
              await services.updateSubscriber(chatId, (user) => {
                const current = user.habits.find((item) => item.id === habit.id);
                if (current) current.lastReminderDate = date;
              });
            });
          }
          if (due.checks.includes(habit.id)) {
            await attempt(chatId, async () => {
              await bot.sendMessage(chatId, habitCheck(habit), {
                reply_markup: { inline_keyboard: [[
                  { text: "✅ Выполнил", callback_data: `habit:${habit.id}:${date}:yes` },
                  { text: "❌ Не выполнил", callback_data: `habit:${habit.id}:${date}:no` },
                ]] },
              });
              await services.updateSubscriber(chatId, (user) => {
                const current = user.habits.find((item) => item.id === habit.id);
                if (current) current.lastCheckDate = date;
              });
            });
          }
        }
      } catch (error) {
        console.error(`delivery to ${chatId} failed:`, error);
      }
    }
  });
  deliveryQueue = operation.catch(() => undefined);
  return operation;
}

export function startScheduledJobs(bot: TelegramBot): void {
  cron.schedule("* * * * *", () => {
    deliverDue(bot).catch((error) => console.error("scheduled delivery failed:", error));
  }, { timezone: "UTC" });
  cron.schedule("0 9 * * 1", () => {
    backupDatabase().catch((error) => console.error("database backup failed:", error));
  }, { timezone: "Europe/Moscow" });
}
