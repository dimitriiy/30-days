import TelegramBot from "node-telegram-bot-api";

import { jsonSubscriberRepository } from "@/server/bot/subscribers";
import "dotenv/config";

console.log(process.env);
const TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";

let bot: TelegramBot | null = null;

export function getBot(): TelegramBot {
  if (!bot) {
    if (!TOKEN) throw new Error("TELEGRAM_BOT_TOKEN not set");
    // ponytail: polling mode. For webhook: new TelegramBot(TOKEN, { webHook: { port, path } })
    bot = new TelegramBot(TOKEN, { polling: true });
  }
  return bot;
}

export async function sendMessage(chatId: number, text: string): Promise<void> {
  await getBot().sendMessage(chatId, text, { parse_mode: "HTML" });
}

export async function broadcast(text: string): Promise<void> {
  const subs = await jsonSubscriberRepository.getAll();
  await Promise.all(
    subs.map((chatId) =>
      sendMessage(chatId, text).catch((err) =>
        console.error(`broadcast to ${chatId} failed:`, err),
      ),
    ),
  );
}

export async function startBot(): Promise<void> {
  const b = getBot();

  b.onText(/^\/(start|subscribe)$/, async (msg) => {
    const chatId = msg.chat.id;
    await jsonSubscriberRepository.add(chatId);
    await b.sendMessage(
      chatId,
      "✅ Подписка активна. Буду присылать уведомления по расписанию.",
    );
  });

  b.onText(/^\/(stop|unsubscribe)$/, async (msg) => {
    const chatId = msg.chat.id;
    await jsonSubscriberRepository.remove(chatId);
    await b.sendMessage(
      chatId,
      "Отписка выполнена. /start чтобы снова подписаться.",
    );
  });

  b.onText(/^\/help$/, async (msg) => {
    await b.sendMessage(
      msg.chat.id,
      "/start, /subscribe — подписаться\n/stop, /unsubscribe — отписаться\n/help — это сообщение",
    );
  });

  b.on("polling_error", (err) => console.error("telegram polling error:", err));

  console.log("telegram bot polling started");
}

export function stopBot(): void {
  if (bot) {
    bot.stopPolling();
    bot = null;
  }
}
