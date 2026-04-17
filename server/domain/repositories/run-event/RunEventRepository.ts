import type { RunEvent } from "@/entities/run-event/model/types";

export interface RunEventRepository {
  getAll(): Promise<RunEvent[]>;
  getById(id: number): Promise<RunEvent | undefined>;
  create(event: Omit<RunEvent, "id">): Promise<RunEvent>;
  update(id: number, updates: Partial<Omit<RunEvent, "id">>): Promise<void>;
  remove(id: number): Promise<void>;
}
