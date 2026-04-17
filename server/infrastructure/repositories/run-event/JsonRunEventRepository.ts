import type { RunEvent } from "@/entities/run-event/model/types";
import type { RunEventRepository } from "@/server/domain/repositories/run-event/RunEventRepository";
import { ensureJsonStore } from "@/server/infrastructure/persistence/json/json-store";

export class JsonRunEventRepository implements RunEventRepository {
  private async getEvents(): Promise<RunEvent[]> {
    const db = await ensureJsonStore();
    return db.data.events ?? [];
  }

  async getAll(): Promise<RunEvent[]> {
    return this.getEvents();
  }

  async getById(id: number): Promise<RunEvent | undefined> {
    const events = await this.getEvents();
    return events.find((e) => e.id === id);
  }

  async create(event: Omit<RunEvent, "id">): Promise<RunEvent> {
    const db = await ensureJsonStore();
    const events = db.data.events ?? [];
    const maxId = events.reduce((max, e) => Math.max(max, e.id), 0);
    const newEvent: RunEvent = { ...event, id: maxId + 1 };
    await db.update((data) => {
      if (!data.events) data.events = [];
      data.events.push(newEvent);
    });
    return newEvent;
  }

  async update(
    id: number,
    updates: Partial<Omit<RunEvent, "id">>,
  ): Promise<void> {
    const db = await ensureJsonStore();
    await db.update((data) => {
      if (!data.events) data.events = [];
      const event = data.events.find((e) => e.id === id);
      if (!event) {
        throw new Error(`RunEvent with id ${id} not found`);
      }
      Object.assign(event, updates);
    });
  }

  async remove(id: number): Promise<void> {
    const db = await ensureJsonStore();
    await db.update((data) => {
      if (!data.events) data.events = [];
      data.events = data.events.filter((e) => e.id !== id);
    });
  }
}

export const jsonRunEventRepository = new JsonRunEventRepository();
