import type { RunEvent } from "@/entities/run-event/model/types";
import type { RunEventRepository } from "@/server/domain/repositories/run-event/RunEventRepository";

export async function createRunEvent(
  repo: RunEventRepository,
  input: Omit<RunEvent, "id">,
): Promise<RunEvent> {
  return repo.create(input);
}
