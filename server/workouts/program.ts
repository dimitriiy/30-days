import { readFileSync } from "node:fs";
import path from "node:path";

export type WorkoutFormat = "EMOM" | "E2MOM" | "E3MOM" | "AMRAP" | "FOR TIME" | "TABATA" | "INTERVALS" | "MIXED";
export type Workout = {
  id: number;
  title: string;
  load: string;
  duration: number;
  format: WorkoutFormat;
  description: string;
};

// The source document is kept intact; each section includes the full exercises,
// scaling options and stimulus rather than an abbreviated copy of the program.
const formats: WorkoutFormat[] = [
  "MIXED", "EMOM", "MIXED", "EMOM", "TABATA", "AMRAP", "FOR TIME",
  "MIXED", "E2MOM", "EMOM", "INTERVALS", "AMRAP", "MIXED", "EMOM",
  "MIXED", "MIXED", "EMOM", "MIXED", "AMRAP", "E2MOM", "INTERVALS",
  "E3MOM", "MIXED", "AMRAP", "MIXED", "EMOM", "FOR TIME", "EMOM",
  "MIXED", "FOR TIME",
];

export function parseWorkouts(markdown: string): Workout[] {
  const matches = [...markdown.matchAll(/^### День (\d+) — (.+)$/gm)];
  const workouts = matches.map((match, index) => {
    const id = Number(match[1]);
    const section = markdown.slice(match.index! + match[0].length, matches[index + 1]?.index ?? markdown.indexOf("## Безопасность", match.index)).split(/\n---\s*\n/)[0].trim();
    const duration = section.match(/\*\*Длительность WOD:\*\*\s*(\d+)(?:[–-](\d+))?/);
    if (id !== index + 1 || !duration || !formats[index]) throw new Error(`Некорректная тренировка ${id}`);
    return {
      id,
      title: match[2],
      load: section.match(/\*\*Нагрузка:\*\*\s*(.+)/)?.[1] ?? "Всё тело",
      duration: Number(duration[2] ?? duration[1]),
      format: formats[index],
      description: section.replace(/^\*\*Нагрузка:\*\*[^\n]*\n/, "").replace(/^\*\*Длительность WOD:\*\*[^\n]*\n/, "").trim(),
    };
  });
  if (workouts.length !== 30) throw new Error("Ожидалось 30 тренировок");
  return workouts;
}

export function getWorkouts(): Workout[] {
  return parseWorkouts(readFileSync(path.join(process.cwd(), "server/workouts/program.md"), "utf8"));
}
