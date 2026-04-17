import type { RunEventRepository } from "@/server/domain/repositories/run-event/RunEventRepository";

export async function updateRunEvent(
  repo: RunEventRepository,
  input: { id: number; date: string; name: string; location: string; pic?: string },
): Promise<void> {
  await repo.update(input.id, {
    date: input.date,
    name: input.name,
    location: input.location,
    pic: input.pic,
  });
}
