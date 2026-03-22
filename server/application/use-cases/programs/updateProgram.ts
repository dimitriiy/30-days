import type { ProgramRepository } from "@/server/domain/repositories/programs/ProgramRepository";

export async function updateProgram(
  programs: ProgramRepository,
  input: { id: number; date: string; program: string; distance: number },
): Promise<void> {
  await programs.update(input.id, {
    date: input.date,
    program: input.program,
    distance: input.distance,
  });
}
