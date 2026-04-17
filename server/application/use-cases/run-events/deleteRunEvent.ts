import type { RunEventRepository } from "@/server/domain/repositories/run-event/RunEventRepository";

export async function deleteRunEvent(
  repo: RunEventRepository,
  id: number,
): Promise<void> {
  await repo.remove(id);
}
