
import { TrainingItem } from "@/entities/workout/model/types";
import type { DoneRepository } from "@/server/domain/repositories/programs/DoneRepository";
import type { ProgramRepository } from "@/server/domain/repositories/programs/ProgramRepository";

export async function getProgramsWithDone(
  programs: ProgramRepository,
  done: DoneRepository,
): Promise<TrainingItem[]> {
  const [programList, doneIds] = await Promise.all([
    programs.getAll(),
    done.getIds(),
  ]);
  const doneSet = new Set(doneIds);
  return programList.map((program) => ({
    ...program,
    isDone: doneSet.has(program.id),
  }));
}
