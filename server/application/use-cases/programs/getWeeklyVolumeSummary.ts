import type { DoneRepository } from "@/server/domain/repositories/programs/DoneRepository";
import type { ProgramRepository } from "@/server/domain/repositories/programs/ProgramRepository";

function parseDate(d: string): Date {
  const [dd, mm, yyyy] = d.split(".").map(Number);
  return new Date(yyyy, mm - 1, dd);
}

function startOfDay(d: Date): Date {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

const fmt = (d: Date) =>
  `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;

export interface WeeklyVolumeSummaryInput {
  programs: ProgramRepository;
  done: DoneRepository;
  /** точка отсчёта «сегодня»; по умолчанию new Date() */
  now?: Date;
  /** -1 = предыдущая неделя (по умолчанию), 0 = текущая */
  weekOffset?: -1 | 0;
}

export interface WeeklyVolumeSummary {
  rangeStart: Date;
  rangeEnd: Date;
  totalPrograms: number;
  plannedKm: number;
  doneKm: number;
  remainingKm: number;
  text: string;
}

export async function getWeeklyVolumeSummary(
  input: WeeklyVolumeSummaryInput,
): Promise<WeeklyVolumeSummary> {
  const { programs, done, now = new Date(), weekOffset = -1 } = input;

  const [programList, doneIds] = await Promise.all([
    programs.getAll(),
    done.getIds(),
  ]);
  const doneSet = new Set(doneIds);

  const today = startOfDay(now);
  const dayOfWeek = (today.getDay() + 6) % 7; // 0=пн
  const mondayThisWeek = new Date(today);
  mondayThisWeek.setDate(today.getDate() - dayOfWeek);

  const rangeStart = new Date(mondayThisWeek);
  rangeStart.setDate(mondayThisWeek.getDate() + weekOffset * 7);
  const rangeEnd = new Date(mondayThisWeek);
  rangeEnd.setDate(mondayThisWeek.getDate() + weekOffset * 7 + 6);

  const inRange = (d: Date) => d >= rangeStart && d <= rangeEnd;

  const weekPrograms = programList.filter(
    (p) => p.distance > 0 && inRange(parseDate(p.date)),
  );
  const planned = weekPrograms.reduce((s, p) => s + p.distance, 0);
  const doneKm = weekPrograms
    .filter((p) => doneSet.has(p.id))
    .reduce((s, p) => s + p.distance, 0);

  const label = weekOffset === 0 ? "Текущая неделя" : "Итоги недели";
  const text = [
    `📊 <b>${label} ${fmt(rangeStart)} — ${fmt(rangeEnd)}</b>`,
    ``,
    `Тренировок в плане: ${weekPrograms.length}`,
    `Запланированный объём: <b>${planned.toFixed(1)} км</b>`,
    `Выполнено: <b>${doneKm.toFixed(1)} км</b>`,
    `Осталось: <b>${(planned - doneKm).toFixed(1)} км</b>`,
  ].join("\n");

  return {
    rangeStart,
    rangeEnd,
    totalPrograms: weekPrograms.length,
    plannedKm: planned,
    doneKm,
    remainingKm: planned - doneKm,
    text,
  };
}
