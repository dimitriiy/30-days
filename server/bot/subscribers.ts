import { ensureJsonStore } from "@/server/infrastructure/persistence/json/json-store";

export class JsonSubscriberRepository {
  async getAll(): Promise<number[]> {
    const db = await ensureJsonStore();
    return db.data.subscribers;
  }

  async add(chatId: number): Promise<void> {
    const db = await ensureJsonStore();
    await db.update((data) => {
      if (!data.subscribers.includes(chatId)) {
        data.subscribers.push(chatId);
      }
    });
  }

  async remove(chatId: number): Promise<void> {
    const db = await ensureJsonStore();
    await db.update((data) => {
      data.subscribers = data.subscribers.filter((id) => id !== chatId);
    });
  }
}

export const jsonSubscriberRepository = new JsonSubscriberRepository();
