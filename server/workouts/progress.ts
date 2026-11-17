export type WorkoutProgress = { done: boolean; comment: string };
export type ProgressByUser = Record<string, Record<string, WorkoutProgress>>;

export function userProgress(all: ProgressByUser | undefined, userId: number): Record<string, WorkoutProgress> {
  return structuredClone(all?.[String(userId)] ?? {});
}

export function updateUserProgress(all: ProgressByUser, userId: number, id: number, progress: WorkoutProgress): void {
  all[String(userId)] ??= {};
  all[String(userId)][String(id)] = progress;
}
