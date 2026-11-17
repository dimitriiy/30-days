import assert from "node:assert/strict";
import { test } from "node:test";

import { getWorkouts } from "./program";
import { timerPosition, warningTimes } from "../../features/workouts/model/timer";
import { updateUserProgress, userProgress, type ProgressByUser } from "./progress";
import { signToken, verifyToken } from "../application/user/token";

test("JSON program contains 30 ordered workouts with explicit timed parts", () => {
  const workouts = getWorkouts();
  assert.deepEqual(workouts.map((item) => item.id), Array.from({ length: 30 }, (_, index) => index + 1));
  assert.ok(workouts.every((item) => item.title && item.load && item.notes && item.parts.every((part) => part.label && part.content && part.seconds > 0)));
  assert.ok(workouts.every((item) => !item.parts.some((part) => part.content.includes("## Неделя"))));
  assert.match(workouts[0].parts[0].content, /12 становых тяг/);
  assert.match(workouts[29].parts[0].content, /30 финальных бёрпи/);
  assert.equal(workouts[4].format, "TABATA");
  assert.match(workouts[4].parts[2].content, /обратные выпады/);
  assert.match(workouts[15].parts[3].content, /AMRAP 4/);
});

test("JWTs require a secret, are signed and expire", () => {
  const previous = process.env.AUTH_SECRET;
  try {
    delete process.env.AUTH_SECRET;
    assert.throws(() => signToken(42), /AUTH_SECRET/);
    process.env.AUTH_SECRET = "test-secret-at-least-thirty-two-characters";
    const token = signToken(42);
    const [header, payload, signature] = token.split(".");
    assert.equal(JSON.parse(Buffer.from(header, "base64url").toString()).alg, "HS256");
    assert.equal(verifyToken(token), 42);
    assert.equal(verifyToken(signToken(42, -1000)), null);
    const altered = Buffer.from(JSON.stringify({ sub: "43", exp: Date.now() })).toString("base64url");
    assert.equal(verifyToken(`${header}.${altered}.${signature}`), null);
    assert.equal(verifyToken(`${header}.${payload}.deadbeef`), null);
    assert.equal(verifyToken("garbage"), null);
  } finally {
    if (previous === undefined) delete process.env.AUTH_SECRET;
    else process.env.AUTH_SECRET = previous;
  }
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
    const phases = workout.parts;
    assert.equal(phases.reduce((seconds, phase) => seconds + phase.seconds, 0), workout.duration * 60, `workout ${workout.id}`);
    assert.ok(phases.every((phase, index) => phase.label === workout.parts[index].label && workout.parts[index].content), `workout ${workout.id}`);
  }
  const phases = getWorkouts()[0].parts;
  assert.equal(timerPosition(phases, 479).phase.label, "AMRAP · тест DT");
  assert.equal(timerPosition(phases, 600).phase.label, "Отдых");
  assert.equal(timerPosition(phases, 720).phase.label, "EMOM · добивка");
  assert.equal(timerPosition(phases, 720).round, 1);
  assert.equal(timerPosition(phases, 770).roundRemaining, 10);
  assert.equal(timerPosition(phases, 1200).remaining, 0);
  assert.equal(timerPosition(phases, 1200).roundRemaining, 0);
  assert.deepEqual(warningTimes(phases).slice(0, 2), [590, 770]);
  assert.equal(warningTimes(phases).at(-1), 1190);
  const tabata = getWorkouts()[4].parts;
  assert.equal(timerPosition(tabata, 19).segment, "Работа");
  assert.equal(timerPosition(tabata, 20).segment, "Отдых / переход");
  assert.equal(timerPosition(tabata, 240).phase.label, "Отдых");
  assert.equal(timerPosition(tabata, 300).phase.label, "Табата · блок 2");
  assert.equal(warningTimes(tabata).length, 33);
  assert.equal(warningTimes(tabata).at(-1), 1190);
  const swoleTel = getWorkouts()[15].parts;
  assert.equal(timerPosition(swoleTel, 240).index, 1);
  assert.equal(timerPosition(swoleTel, 720).index, 3);
  assert.equal(timerPosition(swoleTel, 960).phase.label, "Отдых");
  assert.equal(timerPosition(swoleTel, 1020).index, 5);
});
