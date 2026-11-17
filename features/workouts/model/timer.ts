import type { Workout, WorkoutFormat } from "@/server/workouts/program";

export type TimerPhase = {
  label: string;
  seconds: number;
  interval?: number;
  workSeconds?: number;
};

// Exact phase boundaries for workouts whose formats change mid-session.
const mixed: Record<number, TimerPhase[]> = {
  1: [
    { label: "AMRAP · тест DT", seconds: 600 },
    { label: "Отдых", seconds: 120 },
    { label: "EMOM · добивка", seconds: 480, interval: 60 },
  ],
  3: [
    { label: "E2MOM · сила", seconds: 480, interval: 120 },
    { label: "Отдых", seconds: 120 },
    { label: "For Time · Элизабет", seconds: 480 },
    { label: "EMOM · кор", seconds: 180, interval: 60 },
  ],
  8: [
    { label: "For Time · жим и тяга", seconds: 540 },
    { label: "Отдых", seconds: 120 },
    { label: "AMRAP · финиш", seconds: 540 },
  ],
  13: [
    { label: "AMRAP · лестница", seconds: 900 },
    { label: "Отдых", seconds: 60 },
    { label: "EMOM · кор", seconds: 240, interval: 60 },
  ],
  15: [
    { label: "For Time · Диана", seconds: 480 },
    { label: "Отдых", seconds: 120 },
    { label: "AMRAP · пляж", seconds: 600 },
  ],
  16: [
    { label: "EMOM · тяги", seconds: 720, interval: 60 },
    { label: "AMRAP · жим", seconds: 240 },
    { label: "Отдых", seconds: 60 },
    { label: "EMOM · кор", seconds: 180, interval: 60 },
  ],
  18: [
    { label: "For Time · Open 24.1", seconds: 900 },
    { label: "Отдых", seconds: 120 },
    { label: "EMOM · кор", seconds: 240, interval: 60 },
  ],
  23: [
    { label: "For Time · Тамилсон", seconds: 960 },
    { label: "Отдых", seconds: 60 },
    { label: "EMOM · марш", seconds: 180, interval: 60 },
  ],
  25: [
    { label: "For Time · Нэнси", seconds: 900 },
    { label: "Отдых", seconds: 60 },
    { label: "EMOM · стабилизация", seconds: 240, interval: 60 },
  ],
  29: [
    { label: "AMRAP · тест DT", seconds: 600 },
    { label: "Отдых", seconds: 120 },
    { label: "EMOM · добивка", seconds: 480, interval: 60 },
  ],
};

export function timerPhases(workout: Workout): TimerPhase[] {
  if (mixed[workout.id]) return mixed[workout.id];
  if (workout.id === 11)
    return [{ label: "Push / Pull · 4 круга", seconds: 1200, interval: 300, workSeconds: 240 }];
  if (workout.id === 5)
    return [
      ...Array.from({ length: 4 }, (_, index) => [
        {
          label: `Табата · блок ${index + 1}`,
          seconds: 240,
          interval: 30,
          workSeconds: 20,
        },
        ...(index < 3 ? [{ label: "Отдых", seconds: 60 }] : []),
      ]).flat(),
      { label: "Ягодичный мост", seconds: 60 },
    ];
  const intervals: Partial<Record<WorkoutFormat, number>> = {
    EMOM: 60,
    E2MOM: 120,
    E3MOM: 180,
  };
  return [
    {
      label:
        workout.format === "FOR TIME" ? "Время выполнения" : workout.format,
      seconds: workout.duration * 60,
      interval: workout.id === 21 ? 60 : intervals[workout.format],
      workSeconds: workout.id === 21 ? 40 : undefined,
    },
  ];
}

export function warningTimes(phases: TimerPhase[]): number[] {
  const times: number[] = [];
  let offset = 0;
  for (const phase of phases) {
    if (phase.label !== "Отдых") {
      const interval = phase.interval ?? phase.seconds;
      for (let end = interval; end <= phase.seconds; end += interval) {
        if (end > 10) times.push(offset + end - 10);
      }
    }
    offset += phase.seconds;
  }
  return times;
}

export function timerPosition(phases: TimerPhase[], elapsed: number) {
  let start = 0;
  for (const [index, phase] of phases.entries()) {
    if (elapsed < start + phase.seconds || index === phases.length - 1) {
      const current = Math.min(Math.max(0, elapsed - start), phase.seconds);
      const intervalElapsed = current % (phase.interval ?? phase.seconds);
      const round = phase.interval
        ? Math.min(
            Math.ceil(phase.seconds / phase.interval),
            Math.floor(current / phase.interval) + 1,
          )
        : 0;
      return {
        phase,
        index,
        remaining: Math.max(0, phase.seconds - current),
        roundRemaining: phase.interval && current < phase.seconds ? phase.interval - intervalElapsed : 0,
        round,
        segment:
          current >= phase.seconds || phase.workSeconds === undefined
            ? ""
            : intervalElapsed < phase.workSeconds
              ? "Работа"
              : "Отдых / переход",
        segmentRemaining:
          current >= phase.seconds || phase.workSeconds === undefined
            ? 0
            : intervalElapsed < phase.workSeconds
              ? phase.workSeconds - intervalElapsed
              : phase.interval! - intervalElapsed,
      };
    }
    start += phase.seconds;
  }
  throw new Error("Таймер без этапов");
}
