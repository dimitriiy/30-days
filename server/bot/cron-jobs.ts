import cron from "node-cron";

import { getWeeklyVolumeSummary } from "@/server/application/use-cases/programs/getWeeklyVolumeSummary";
import { broadcast } from "@/server/bot/telegram";
import { jsonDoneRepository } from "@/server/infrastructure/repositories/programs/JsonDoneRepository";
import { jsonProgramRepository } from "@/server/infrastructure/repositories/programs/JsonProgramRepository";
import { backupDatabase } from "../application/backup";

// ====== cron job registry ======
// Каждый джоб: { name, schedule, description, run }.
// Чтобы добавить новый — допиши объект в массив `jobs`.
// Бизнес-логика живёт в use-cases; здесь — только расписание и вызов.
// ponytail: простой массив вместо плагиновой системы; пока хватает.

export interface ScheduledJob {
  name: string;
  schedule: string;
  description: string;
  run: () => Promise<void>;
}

async function weeklyVolumeSummaryJob(): Promise<void> {
  const summary = await getWeeklyVolumeSummary({
    programs: jsonProgramRepository,
    done: jsonDoneRepository,
  });
  await broadcast(summary.text);
}

export const jobs: ScheduledJob[] = [
  {
    name: "weekly-volume-summary",
    schedule: "0 9 * * 1", // пн 09:00
    description: "Суммарный объём тренировок за предыдущую неделю",
    run: weeklyVolumeSummaryJob,
  },

  {
    name: "backup-bd",
    schedule: "0 9 * * 1",
    description: "Бекап БД",
    run: backupDatabase,
  },
];

export function startScheduledJobs(): void {
  for (const job of jobs) {
    if (!cron.validate(job.schedule)) {
      console.error(`invalid cron schedule for ${job.name}: ${job.schedule}`);
      continue;
    }
    cron.schedule(job.schedule, () => {
      job.run().catch((err) => console.error(`job ${job.name} failed:`, err));
    });
    console.log(
      `scheduled: ${job.name} [${job.schedule}] — ${job.description}`,
    );
  }
}
