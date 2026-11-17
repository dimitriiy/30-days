import assert from "node:assert/strict";
import { test } from "node:test";

import { getWorkouts, parseWorkouts } from "./program";
import { timerPhases, timerPosition, warningTimes } from "../../features/workouts/model/timer";
import { updateUserProgress, userProgress, type ProgressByUser } from "./progress";
import { createSession, isSessionActive } from "../application/user/sessionFactory";

test("program contains 30 ordered workouts with full descriptions and no week headings", () => {
  const workouts = getWorkouts();
  assert.deepEqual(workouts.map((item) => item.id), Array.from({ length: 30 }, (_, index) => index + 1));
  assert.ok(workouts.every((item) => item.title && item.load && item.description.length > 200));
  assert.ok(workouts.every((item) => !item.description.includes("## Неделя")));
  assert.match(workouts[0].description, /12 становых тяг/);
  assert.match(workouts[29].description, /30 финальных бёрпи/);
  assert.equal(workouts[4].format, "TABATA");
  assert.throws(() => parseWorkouts("### День 1 — тест\n**Длительность WOD:** 20 минут"), /30 тренировок/);
});

test("expired sessions cannot access private workout progress", () => {
  const defaultSession = createSession(42);
  assert.ok(Math.abs(defaultSession.expiresAt - Date.now() - 7 * 24 * 60 * 60 * 1000) < 1000);
  const session = createSession(42, {}, 1000);
  assert.equal(isSessionActive(session, session.expiresAt - 1), true);
  assert.equal(isSessionActive(session, session.expiresAt), false);
  assert.equal(isSessionActive(null), false);
});

test("progress and comments are isolated by account and workout", () => {
  const all: ProgressByUser = {};
  updateUserProgress(all, 1, 1, { done: true, comment: "2 × 12 кг" });
  updateUserProgress(all, 2, 1, { done: false, comment: "" });
  updateUserProgress(all, 1, 29, { done: false, comment: "Повторить тест" });
  assert.deepEqual(userProgress(all, 2), { "1": { done: false, comment: "" } });
  assert.equal(userProgress(all, 1)["1"].comment, "2 × 12 кг");
  assert.equal(userProgress(all, 1)["29"].done, false);
  assert.deepEqual(userProgress(undefined, 3), {});
});

test("timer phases cover each WOD and switch at exact boundaries", () => {
  for (const workout of getWorkouts()) {
    const phases = timerPhases(workout);
    assert.equal(phases.reduce((seconds, phase) => seconds + phase.seconds, 0), workout.duration * 60, `workout ${workout.id}`);
  }
  const phases = timerPhases(getWorkouts()[0]);
  assert.equal(timerPosition(phases, 479).round, 8);
  assert.equal(timerPosition(phases, 50).roundRemaining, 10);
  assert.equal(timerPosition(phases, 60).roundRemaining, 60);
  assert.equal(timerPosition(phases, 480).phase.label, "Отдых");
  assert.equal(timerPosition(phases, 600).phase.label, "AMRAP · тест DT");
  assert.equal(timerPosition(phases, 1200).remaining, 0);
  assert.equal(timerPosition(phases, 1200).roundRemaining, 0);
  assert.deepEqual(warningTimes(phases).slice(0, 2), [50, 110]);
  assert.equal(warningTimes(phases).at(-1), 1190);
  const tabata = timerPhases(getWorkouts()[4]);
  assert.equal(timerPosition(tabata, 19).segment, "Работа");
  assert.equal(timerPosition(tabata, 20).segment, "Отдых / переход");
  assert.equal(timerPosition(tabata, 240).phase.label, "Отдых");
  assert.equal(timerPosition(tabata, 300).phase.label, "Табата · блок 2");
  assert.equal(warningTimes(tabata).length, 33);
  assert.equal(warningTimes(tabata).at(-1), 1190);
});
