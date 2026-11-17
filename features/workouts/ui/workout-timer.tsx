"use client";

import { memo } from "react";
import { Minimize2, Maximize2, Pause, Play, RotateCcw, Timer, Volume2, VolumeX } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import type { Workout } from "@/server/workouts/program";
import { useWorkoutTimer } from "./use-workout-timer";

const clock = (seconds: number) =>
  `${Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0")}:${Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0")}`;

const PhaseContent = memo(function PhaseContent({ label, content }: { label: string; content: string }) {
  return <><h3 className="text-lg font-semibold text-[var(--workout-text)]">{label}</h3><ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown></>;
});

export function WorkoutTimer({ workout, fullScreen, onFullScreenChange }: {
  workout: Workout;
  fullScreen: boolean;
  onFullScreenChange: (value: boolean) => void;
}) {
  const { elapsed, running, soundOn, phases, total, readout, toggle, reset, toggleSound } = useWorkoutTimer(workout);
  const { phase, index, remaining, round, segment, segmentRemaining, countUp, display } = readout;

  return (
    <section
      className={fullScreen ? "flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--workout-sheet)] text-center sm:flex-row" : "rounded-[28px] border border-[var(--workout-accent-border)] bg-[var(--workout-surface)] p-5 text-center"}
      aria-label="Таймер тренировки"
    >
      <div className={fullScreen ? "flex h-[55%] shrink-0 flex-col justify-center px-3 pt-[env(safe-area-inset-top)] sm:h-full sm:w-1/2 sm:px-6" : ""}>
      <div className="flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--workout-accent)]">
        <Timer size={17} /> Таймер WOD
        <button type="button" onClick={() => onFullScreenChange(!fullScreen)} aria-label={fullScreen ? "Свернуть таймер" : "Развернуть таймер на весь экран"} className="ml-2 grid size-10 place-items-center rounded-xl bg-[var(--workout-chip)] text-[var(--workout-text)]">
          {fullScreen ? <Minimize2 size={19} /> : <Maximize2 size={19} />}
        </button>
      </div>
      <div
        className={fullScreen ? "mx-auto my-1 grid size-[min(29dvh,15rem)] place-items-center rounded-full p-2 sm:size-[min(40dvh,calc(50vw-3rem),22rem)]" : "mx-auto my-5 grid size-52 place-items-center rounded-full p-2"}
        style={{ background: `conic-gradient(var(--workout-accent) ${(elapsed / total) * 100}%, var(--workout-ring) 0)` }}
      >
        <div className="flex size-full flex-col items-center justify-center rounded-full bg-[var(--workout-surface)]">
          <span className="text-xs uppercase tracking-widest text-[var(--workout-muted)]">
            {elapsed >= total ? "Готово" : phase.label}
          </span>
          <span
            className={`mt-1 font-mono text-5xl font-bold tabular-nums tracking-tight text-[var(--workout-text)] ${fullScreen ? "sm:text-6xl" : ""}`}
            role="timer"
            aria-label={`${countUp ? "Прошло" : "Осталось"} ${clock(display)}`}
          >
            {clock(display)}
          </span>
          <span className="mt-1 text-xs text-[var(--workout-muted)]">
            {phase.interval || phases.length > 1 ? `WOD: осталось ${clock(total - elapsed)}` : countUp ? `Лимит ${clock(total)}` : `из ${clock(total)}`}
          </span>
        </div>
      </div>
      <div className="min-h-12 text-sm text-[var(--workout-detail)]">
        <span>
          {phases.length > 1
            ? `Этап ${index + 1}/${phases.length} · ${phase.label} · ${clock(remaining)}`
            : phase.interval
              ? `Раунд ${round}/${Math.ceil(phase.seconds / phase.interval)}`
              : "Следите за техникой и дыханием"}
        </span>
        {phase.interval && phases.length > 1 && (
          <span className="block text-[var(--workout-muted)]">
            Раунд {round}/{Math.ceil(phase.seconds / phase.interval)}
          </span>
        )}
        {segment && (
          <span className="block font-semibold text-[var(--workout-accent)]">
            {segment} · {clock(segmentRemaining)}
          </span>
        )}
      </div>
      <div className={fullScreen ? "mx-auto mt-1 flex w-full max-w-xl gap-2" : "mt-3 flex gap-3"}>
        <button
          type="button"
          onClick={toggle}
          disabled={elapsed >= total}
          className={`${fullScreen ? "h-12" : "h-14"} flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[var(--workout-accent)] font-bold text-[var(--workout-on-accent)] disabled:opacity-50`}
        >
          {running ? <Pause size={21} /> : <Play size={21} fill="currentColor" />}
          {running ? "Пауза" : "Старт"}
        </button>
        <button
          type="button"
          onClick={toggleSound}
          aria-label={soundOn ? "Выключить звук" : "Включить звук"}
          aria-pressed={soundOn}
          className={`${fullScreen ? "size-12" : "size-14"} grid place-items-center rounded-2xl bg-[var(--workout-chip)] text-[var(--workout-text)]`}
        >
          {soundOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>
        <button
          type="button"
          onClick={reset}
          aria-label="Сбросить таймер"
          className={`${fullScreen ? "size-12" : "size-14"} grid place-items-center rounded-2xl bg-[var(--workout-chip)] text-[var(--workout-text)]`}
        >
          <RotateCcw size={20} />
        </button>
      </div>
      </div>
      {fullScreen && <div className="workout-markdown min-h-0 flex-1 overflow-y-auto overscroll-contain border-t border-[var(--workout-border)] px-5 pb-[calc(16px+env(safe-area-inset-bottom))] pt-4 text-left text-base leading-relaxed text-[var(--workout-detail)] sm:h-full sm:w-1/2 sm:border-l sm:border-t-0 sm:px-8 sm:pt-8" key={index}>
        <PhaseContent label={phase.label} content={workout.parts[index].content} />
      </div>}
    </section>
  );
}
