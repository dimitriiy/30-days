import type { DoneRepository } from "@/server/domain/repositories/programs/DoneRepository";

export async function toggleProgramDone(
  done: DoneRepository,
  input: { id: number; done: boolean },
): Promise<void> {
  if (input.done) {
    await done.add(input.id);
  } else {
    await done.remove(input.id);
  }
}
