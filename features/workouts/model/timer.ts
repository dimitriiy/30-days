import type { WorkoutFormat } from "@/server/workouts/program";

export type TimerPhase = {
  label: string;
  seconds: number;
  interval?: number;
  workSeconds?: number;
};

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

export function audioCueTimes(warnings: number[], total: number, from: number) {
  return [
    { finish: false, delay: 0.05 }, // Audible confirmation that sound is enabled.
    ...warnings.filter((warning) => warning > from).map((warning) => ({ finish: false, delay: warning - from })),
    { finish: true, delay: total - from },
  ];
}

export function elapsedSeconds(startedAt: number, now: number, total: number): number {
  return Math.min(total, Math.max(0, Math.floor((now - startedAt) / 1000)));
}

export function timerReadout(phases: TimerPhase[], elapsed: number, format: WorkoutFormat) {
  const position = timerPosition(phases, elapsed);
  const { phase, remaining, roundRemaining } = position;
  const total = phases.reduce((sum, item) => sum + item.seconds, 0);
  const countUp = format === "FOR TIME" || phase.label.startsWith("For Time");
  const display = phase.interval ? roundRemaining
    : phases.length > 1 ? countUp ? phase.seconds - remaining : remaining
    : countUp ? elapsed : total - elapsed;
  return { ...position, countUp, display };
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
