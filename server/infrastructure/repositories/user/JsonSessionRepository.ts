import type { Session } from "@/server/domain/entities/user/User";
import type { SessionRepository } from "@/server/domain/repositories/user/SessionRepository";

import { ensureJsonStore } from "@/server/infrastructure/persistence/json/json-store";

export class JsonSessionRepository implements SessionRepository {
  async create(session: Session) {
    const db = await ensureJsonStore();
    await db.update((data) => {
      data.sessions[session.token] = session;
    });
  }

  async findByToken(token: string) {
    const db = await ensureJsonStore();
    return db.data.sessions[token] ?? null;
  }
}

export const jsonSessionRepository = new JsonSessionRepository();
