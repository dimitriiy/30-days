import TelegramBot from "node-telegram-bot-api";

import { getWeeklyVolumeSummary } from "@/server/application/use-cases/programs/getWeeklyVolumeSummary";
import { jsonSubscriberRepository } from "@/server/bot/subscribers";
import { jsonDoneRepository } from "@/server/infrastructure/repositories/programs/JsonDoneRepository";
import { jsonProgramRepository } from "@/server/infrastructure/repositories/programs/JsonProgramRepository";
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
      "/start, /subscribe — подписаться\n/stop, /unsubscribe — отписаться\n/stats — статистика по неделе\n/stats_current — текущая неделя\n/stats_previous — предыдущая неделя\n/help — это сообщение",
    );
  });

  // /stats — показывает inline-кнопки выбора недели
  b.onText(/^\/stats$/, async (msg) => {
    await b.sendMessage(msg.chat.id, "📊 Выбери неделю:", {
      reply_markup: {
        inline_keyboard: [
          [
            { text: "Текущая неделя", callback_data: "stats:0" },
            { text: "Предыдущая неделя", callback_data: "stats:-1" },
          ],
        ],
      },
    });
  });

  async function sendStats(chatId: number, weekOffset: -1 | 0): Promise<void> {
    const summary = await getWeeklyVolumeSummary({
      programs: jsonProgramRepository,
      done: jsonDoneRepository,
      weekOffset,
    });
    await b.sendMessage(chatId, summary.text, { parse_mode: "HTML" });
  }

  b.onText(/^\/stats_current$/, (msg) =>
    sendStats(msg.chat.id, 0).catch((err) =>
      console.error("stats_current failed:", err),
    ),
  );

  b.onText(/^\/stats_previous$/, (msg) =>
    sendStats(msg.chat.id, -1).catch((err) =>
      console.error("stats_previous failed:", err),
    ),
  );

  // обработка нажатий inline-кнопок
  b.on("callback_query", (query) => {
    const data = query.data;
    const chatId = query.message?.chat.id;
    if (!chatId || !data?.startsWith("stats:")) return;
    const offset = data === "stats:0" ? 0 : -1;
    b.answerCallbackQuery(query.id).catch(() => {});
    sendStats(chatId, offset as -1 | 0).catch((err) =>
      console.error("stats callback failed:", err),
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
