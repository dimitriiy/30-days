import type { User } from "@/server/domain/entities/user/User";
import type { UserRepository } from "@/server/domain/repositories/user/UserRepository";

import { ensureJsonStore } from "@/server/infrastructure/persistence/json/json-store";

function generateId() {
  return Math.floor(Math.random() * 100000000);
}

export class JsonUserRepository implements UserRepository {
  async findByEmail(email: string) {
    const db = await ensureJsonStore();
    return (
      Object.values(db.data.users).find((user) => user.email === email) ??
      null
    );
  }

  async getById(id: number) {
    const db = await ensureJsonStore();
    return db.data.users[id] ?? null;
  }

  async create(user: Omit<User, "id">) {
    const db = await ensureJsonStore();
    const id = generateId();
    await db.update((data) => {
      data.users[id] = { ...user, id };
    });
  }
}

export const jsonUserRepository = new JsonUserRepository();
