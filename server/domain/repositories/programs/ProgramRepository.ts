import { Training } from "@/entities/workout/model/types";


export interface ProgramRepository {
  getAll(): Promise<Training[]>;
  getById(id: number): Promise<Training | undefined>;
  update(
    id: number,
    updates: Partial<Omit<Training, "id">>,
  ): Promise<void>;
}
