import assert from "node:assert/strict";
import { test } from "node:test";

import { audioCueTimes, elapsedSeconds, timerReadout, type TimerPhase } from "./timer";

test("audio confirms start, schedules warnings and omits elapsed cues on resume", () => {
  const warnings = [10, 30];
  assert.deepEqual(audioCueTimes(warnings, 40, 0), [
    { finish: false, delay: 0.05 },
    { finish: false, delay: 10 },
    { finish: false, delay: 30 },
    { finish: true, delay: 40 },
  ]);
  assert.deepEqual(audioCueTimes(warnings, 40, 20), [
    { finish: false, delay: 0.05 },
    { finish: false, delay: 10 },
    { finish: true, delay: 20 },
  ]);
});

test("elapsed time survives throttled ticks and resumes after a pause", () => {
  const total = 120;
  assert.equal(elapsedSeconds(100_000, 100_000, total), 0);
  const pausedAt = elapsedSeconds(100_000, 103_999, total);
  assert.equal(pausedAt, 3);
  const resumedAt = 200_000 - pausedAt * 1000;
  assert.equal(elapsedSeconds(resumedAt, 200_000, total), pausedAt);
  assert.equal(elapsedSeconds(resumedAt, 207_999, total), 10);
  assert.equal(elapsedSeconds(resumedAt, 400_000, total), total);
  assert.equal(elapsedSeconds(100_000, 99_000, total), 0);
});

test("readout switches stages at their boundaries and ends at zero", () => {
  const phases: TimerPhase[] = [
    { label: "AMRAP", seconds: 600 },
    { label: "Отдых", seconds: 120 },
    { label: "EMOM", seconds: 480, interval: 60 },
  ];
  assert.equal(timerReadout(phases, 599, "MIXED").display, 1);
  assert.equal(timerReadout(phases, 600, "MIXED").display, 120);
  assert.equal(timerReadout(phases, 720, "MIXED").display, 60);
  assert.equal(timerReadout(phases, 770, "MIXED").display, 10);
  assert.equal(timerReadout(phases, 1200, "MIXED").display, 0);
});

test("readout counts up for For Time and switches from work to rest", () => {
  const forTime: TimerPhase[] = [{ label: "Время выполнения", seconds: 120 }];
  assert.equal(timerReadout(forTime, 0, "FOR TIME").display, 0);
  assert.equal(timerReadout(forTime, 89, "FOR TIME").display, 89);
  assert.equal(timerReadout(forTime, 120, "FOR TIME").display, 120);

  const intervals: TimerPhase[] = [{ label: "Интервалы", seconds: 60, interval: 30, workSeconds: 20 }];
  assert.equal(timerReadout(intervals, 19, "INTERVALS").segment, "Работа");
  assert.equal(timerReadout(intervals, 20, "INTERVALS").segment, "Отдых / переход");
  assert.equal(timerReadout(intervals, 30, "INTERVALS").display, 30);
  assert.equal(timerReadout(intervals, 60, "INTERVALS").display, 0);
});
