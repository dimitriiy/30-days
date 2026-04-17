import type { RunEvent } from "@/entities/run-event/model/types";
import type { RunEventRepository } from "@/server/domain/repositories/run-event/RunEventRepository";

function parseDate(dateStr: string): number {
  const [day, month, year] = dateStr.split(".");
  return new Date(`${year}-${month}-${day}`).getTime();
}

export async function getRunEvents(
  repo: RunEventRepository,
): Promise<RunEvent[]> {
  const events = await repo.getAll();
  return [...events].sort((a, b) => parseDate(a.date) - parseDate(b.date));
}
