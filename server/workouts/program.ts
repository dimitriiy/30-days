import program from "./program.json";

export type WorkoutFormat = "EMOM" | "E2MOM" | "E3MOM" | "AMRAP" | "FOR TIME" | "TABATA" | "INTERVALS" | "MIXED";
export type WorkoutPart = {
  label: string;
  seconds: number;
  interval?: number;
  workSeconds?: number;
  content: string;
};
export type Workout = {
  id: number;
  title: string;
  load: string;
  duration: number;
  format: WorkoutFormat;
  intro: string;
  parts: WorkoutPart[];
  notes: string;
};

export function getWorkouts(): Workout[] {
  return program as Workout[];
}
