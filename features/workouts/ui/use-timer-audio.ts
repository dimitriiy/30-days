import { useEffect, useRef } from "react";

import { audioCueTimes } from "../model/timer";

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

export function useTimerAudio(warnings: number[], total: number) {
  const audio = useRef<AudioContext | null>(null);
  const scheduled = useRef<OscillatorNode[]>([]);

  const stopAudio = () => {
    for (const oscillator of scheduled.current) {
      try { oscillator.stop(); } catch { /* Already finished. */ }
    }
    scheduled.current = [];
  };

  // Schedule on the audio clock so JS timer throttling does not delay cues.
  const startAudio = (from: number) => {
    try {
      audio.current ??= new AudioContext();
      void audio.current.resume().catch(() => {});
      stopAudio();
      const context = audio.current;
      for (const cue of audioCueTimes(warnings, total, from)) {
        scheduled.current.push(...scheduleSignal(context, cue.finish, context.currentTime + cue.delay));
      }
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

  return { startAudio, stopAudio };
}
