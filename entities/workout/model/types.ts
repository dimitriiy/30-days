export type Training = {
  date: string;
  day: number;
  program: string;
  id: number;
  distance: number;
};

/** Training as returned from API (with completion flag when applicable). */
export type TrainingItem = Training & {
  isDone?: boolean;
};
