
import { Training } from "@/entities/workout/model/types";
import type { ProgramRepository } from "@/server/domain/repositories/programs/ProgramRepository";

import { ensureJsonStore } from "@/server/infrastructure/persistence/json/json-store";

export class JsonProgramRepository implements ProgramRepository {
  async getAll() {
    const db = await ensureJsonStore();
    return db.data.programs;
  }

  async getById(id: number) {
    const db = await ensureJsonStore();
    return db.data.programs.find((p) => p.id === id);
  }

  async update(
    id: number,
    updates: Partial<Omit<Training, "id">>,
  ) {
    const db = await ensureJsonStore();
    await db.update(({ programs }) => {
      const program = programs.find((p) => p.id === id);
      if (!program) {
        throw new Error(`Training with id ${id} not found`);
      }
      Object.assign(program, updates);
    });
  }
}

export const jsonProgramRepository = new JsonProgramRepository();
