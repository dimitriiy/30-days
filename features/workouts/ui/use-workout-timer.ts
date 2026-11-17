import { useEffect, useMemo, useState } from "react";

import type { Workout } from "@/server/workouts/program";
import { elapsedSeconds, timerReadout, warningTimes } from "../model/timer";
import { useScreenAwake } from "./use-screen-awake";
import { useTimerAudio } from "./use-timer-audio";

export function useWorkoutTimer(workout: Workout) {
  const phases = workout.parts;
  const warnings = useMemo(() => warningTimes(phases), [phases]);
  const total = phases.reduce((sum, phase) => sum + phase.seconds, 0);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  const { startAudio, stopAudio } = useTimerAudio(warnings, total);
  const { preventSleep, allowSleep } = useScreenAwake();

  useEffect(() => {
    if (!running || startedAt === null) return;
    const tick = () => {
      const next = elapsedSeconds(startedAt, Date.now(), total);
      setElapsed(next);
      if (next >= total) {
        allowSleep();
        setRunning(false);
      }
    };
    const id = window.setInterval(tick, 250);
    tick();
    return () => window.clearInterval(id);
  }, [running, startedAt, total, allowSleep]);

  const toggle = () => {
    if (running) {
      stopAudio();
      allowSleep();
      setRunning(false);
    } else if (elapsed < total) {
      if (soundOn) startAudio(elapsed);
      preventSleep();
      setStartedAt(Date.now() - elapsed * 1000);
      setRunning(true);
    }
  };

  const reset = () => {
    stopAudio();
    allowSleep();
    setRunning(false);
    setStartedAt(null);
    setElapsed(0);
  };

  const toggleSound = () => {
    if (soundOn) stopAudio();
    else if (running) startAudio(elapsed);
    setSoundOn(!soundOn);
  };

  return {
    elapsed, running, soundOn, phases, total,
    readout: timerReadout(phases, elapsed, workout.format),
    toggle, reset, toggleSound,
  };
}
