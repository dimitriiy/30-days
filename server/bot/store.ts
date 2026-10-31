import path from "node:path";

import { JSONFilePreset } from "lowdb/node";

import { DEFAULT_TIME_ZONE, type BotData, type Subscriber } from "./domain";

export function createSubscriberStore(filePath: string): {
  readSubscribers: () => Promise<Subscriber[]>;
  updateSubscriber: (chatId: number, change: (subscriber: Subscriber) => void) => Promise<Subscriber>;
} {
  let dbPromise: ReturnType<typeof JSONFilePreset<BotData>> | null = null;
  let queue = Promise.resolve();

  async function database() {
    dbPromise ??= JSONFilePreset<BotData>(filePath, { subscribers: [] }).then(async (db) => {
      let migrated = false;
      for (const subscriber of db.data.subscribers) {
        if (!subscriber.timeZone) {
          subscriber.timeZone = DEFAULT_TIME_ZONE;
          migrated = true;
        }
      }
      if (migrated) await db.write();
      return db;
    });
    return dbPromise;
  }

  async function readSubscribers(): Promise<Subscriber[]> {
    await queue;
    const db = await database();
    return structuredClone(db.data.subscribers);
  }

  async function updateSubscriber(chatId: number, change: (subscriber: Subscriber) => void): Promise<Subscriber> {
    const operation = queue.then(async () => {
      const db = await database();
      let subscriber = db.data.subscribers.find((item) => item.chatId === chatId);
      if (!subscriber) {
        subscriber = { chatId, active: false, habits: [] };
        db.data.subscribers.push(subscriber);
      }
      change(subscriber);
      await db.write();
      return structuredClone(subscriber);
    });
    queue = operation.then(() => undefined, () => undefined);
    return operation;
  }

  return { readSubscribers, updateSubscriber };
}

export const { readSubscribers, updateSubscriber } = createSubscriberStore(path.join(process.cwd(), "bot-data.json"));
