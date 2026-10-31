import assert from "node:assert/strict";
import test from "node:test";

import type { Habit } from "../domain";
import { habitProgress, habitResult, quoteNotification } from "../messages";

test("progress shows a 30-day checkbox grid and correct totals", () => {
  const habit: Habit = {
    id: "one",
    title: "Говорить чётко и понятно",
    startDate: "2026-06-01",
    reminderTime: "09:00",
    checkTime: "21:00",
    results: { "2026-06-01": true, "2026-06-02": false },
  };
  const text = habitProgress(habit, "2026-06-03");
  assert.match(text, /🎯 Говорить чётко и понятно/);
  assert.match(text, /01–10  ☑️ ❌ ⬜ ▫️/);
  assert.match(text, /☑️ Выполнено: 1  ·  ❌ Не выполнено: 1  ·  ⬜ Без ответа: 1/);
  assert.match(text, /🔔 Напоминание: 09:00  ·  📝 Отметка: 21:00/);
  assert.equal((text.match(/–10|–20|–30/g) ?? []).length, 3);
  assert.ok(text.length < 4096);
});

test("result keeps the habit title and invites correction", () => {
  const habit: Habit = { id: "one", title: "Читать", startDate: "2026-06-01", reminderTime: "09:00", checkTime: "21:00", results: {} };
  assert.match(habitResult(habit, "2026-06-01", true), /☑️ Выполнено/);
  assert.match(habitResult(habit, "2026-06-01", false), /❌ Не выполнено/);
  assert.match(habitResult(habit, "2026-06-01", true), /Ответ можно изменить/);
});

test("quote notification keeps its source wording unchanged", () => {
  const quote = "Ничего не следует делать зря.";
  assert.equal(quoteNotification(quote), `💭 Мысль дня\n\n${quote}`);
});
