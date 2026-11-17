"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, RotateCcw, Timer, Volume2, VolumeX } from "lucide-react";

import type { Workout } from "@/server/workouts/program";
import { timerPhases, timerPosition, warningTimes } from "../model/timer";

const clock = (seconds: number) =>
  `${Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0")}:${Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0")}`;

function scheduleSignal(context: AudioContext, finish: boolean, at: number): OscillatorNode[] {
  return (finish ? [660, 990] : [880]).map((frequency, index) => {
    const start = at + index * 0.2;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.08, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.16);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + 0.16);
    return oscillator;
  });
}

export function WorkoutTimer({ workout }: { workout: Workout }) {
  const phases = useMemo(() => timerPhases(workout), [workout]);
  const warnings = useMemo(() => warningTimes(phases), [phases]);
  const total = phases.reduce((sum, phase) => sum + phase.seconds, 0);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  const audio = useRef<AudioContext | null>(null);
  const scheduled = useRef<OscillatorNode[]>([]);

  const stopAudio = () => {
    for (const oscillator of scheduled.current) {
      try { oscillator.stop(); } catch { /* Already finished. */ }
    }
    scheduled.current = [];
  };

  // Scheduling on the audio clock keeps the cues accurate if JS timers are throttled.
  const startAudio = (from: number) => {
    try {
      audio.current ??= new AudioContext();
      void audio.current.resume().catch(() => {});
      stopAudio();
      const context = audio.current;
      for (const warning of warnings) {
        if (warning > from) scheduled.current.push(...scheduleSignal(context, false, context.currentTime + warning - from));
      }
      scheduled.current.push(...scheduleSignal(context, true, context.currentTime + total - from));
    } catch {
      // Timer continues silently if sound is unavailable.
    }
  };

  useEffect(() => () => {
    for (const oscillator of scheduled.current) {
      try { oscillator.stop(); } catch { /* Already finished. */ }
    }
    void audio.current?.close();
  }, []);

  useEffect(() => {
    if (!running || startedAt === null) return;
    const tick = () => {
      const next = Math.min(total, Math.floor((Date.now() - startedAt) / 1000));
      setElapsed(next);
      if (next >= total) setRunning(false);
    };
    const id = window.setInterval(tick, 250);
    tick();
    return () => window.clearInterval(id);
  }, [running, startedAt, total]);

  const toggle = () => {
    if (running) {
      stopAudio();
      setRunning(false);
    } else if (elapsed < total) {
      if (soundOn) startAudio(elapsed);
      setStartedAt(Date.now() - elapsed * 1000);
      setRunning(true);
    }
  };
  const reset = () => {
    stopAudio();
    setRunning(false);
    setStartedAt(null);
    setElapsed(0);
  };
  const { phase, index, remaining, round, roundRemaining, segment, segmentRemaining } =
    timerPosition(phases, elapsed);
  const countUp = workout.format === "FOR TIME" || phase.label.startsWith("For Time");
  const display = phase.interval ? roundRemaining
    : phases.length > 1 ? countUp ? phase.seconds - remaining : remaining
    : countUp ? elapsed : total - elapsed;

  return (
    <section
      className="rounded-[28px] border border-[var(--workout-accent-border)] bg-[var(--workout-surface)] p-5 text-center"
      aria-label="Таймер тренировки"
    >
      <div className="flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--workout-accent)]">
        <Timer size={17} /> Таймер WOD
      </div>
      <div
        className="mx-auto my-5 grid size-52 place-items-center rounded-full p-2"
        style={{
          background: `conic-gradient(var(--workout-accent) ${(elapsed / total) * 100}%, var(--workout-ring) 0)`,
        }}
      >
        <div className="flex size-full flex-col items-center justify-center rounded-full bg-[var(--workout-surface)]">
          <span className="text-xs uppercase tracking-widest text-[var(--workout-muted)]">
            {elapsed >= total ? "Готово" : phase.label}
          </span>
          <span
            className="mt-1 font-mono text-5xl font-bold tabular-nums tracking-tight text-[var(--workout-text)]"
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
      <div className="mt-3 flex gap-3">
        <button
          type="button"
          onClick={toggle}
          disabled={elapsed >= total}
          className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-[var(--workout-accent)] font-bold text-[var(--workout-on-accent)] disabled:opacity-50"
        >
          {running ? (
            <Pause size={21} />
          ) : (
            <Play size={21} fill="currentColor" />
          )}
          {running ? "Пауза" : "Старт"}
        </button>
        <button
          type="button"
          onClick={() => { if (soundOn) stopAudio(); else if (running) startAudio(elapsed); setSoundOn(!soundOn); }}
          aria-label={soundOn ? "Выключить звук" : "Включить звук"}
          aria-pressed={soundOn}
          className="grid size-14 place-items-center rounded-2xl bg-[var(--workout-chip)] text-[var(--workout-text)]"
        >
          {soundOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>
        <button
          type="button"
          onClick={reset}
          aria-label="Сбросить таймер"
          className="grid size-14 place-items-center rounded-2xl bg-[var(--workout-chip)] text-[var(--workout-text)]"
        >
          <RotateCcw size={20} />
        </button>
      </div>
    </section>
  );
}
