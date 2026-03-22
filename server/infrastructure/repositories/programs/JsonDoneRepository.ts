import type { DoneRepository } from "@/server/domain/repositories/programs/DoneRepository";

import { ensureJsonStore } from "@/server/infrastructure/persistence/json/json-store";

export class JsonDoneRepository implements DoneRepository {
  async getIds() {
    const db = await ensureJsonStore();
    return db.data.done;
  }

  async setAll(ids: number[]) {
    const db = await ensureJsonStore();
    await db.update((data) => {
      data.done = ids;
    });
  }

  async add(id: number) {
    const db = await ensureJsonStore();
    await db.update((data) => {
      if (!data.done.includes(id)) {
        data.done.push(id);
      }
    });
  }

  async remove(id: number) {
    const db = await ensureJsonStore();
    await db.update((data) => {
      if (data.done.includes(id)) {
        data.done = data.done.filter((item) => item !== id);
      }
    });
  }
}

export const jsonDoneRepository = new JsonDoneRepository();
