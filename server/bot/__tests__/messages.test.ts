import assert from "node:assert/strict";
import test from "node:test";

import type { Habit, ReadingDose } from "../domain";
import { habitProgress, habitReminder, habitResult, quoteNotification, readingDose, readingFinale, splitLongMessage } from "../messages";

test("habit reminder contains only the title", () => {
  const habit: Habit = { id: "one", title: "Читать", startDate: "2026-06-01", reminderTime: "09:00", checkTime: "21:00", results: {} };
  assert.equal(habitReminder(habit), "🔔 Привычка на сегодня\n\nЧитать");
});

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

test("reading dose shows the book, paragraph range, and dose counter", () => {
  const dose: ReadingDose = { book: 2, from: 3, to: 4, text: "3. Первая.\n\n4. Вторая." };
  assert.equal(
    readingDose(dose, 7, 128),
    "📖 «Наедине с собой»\nКнига II, §3–4 · доза 7/128\n\n3. Первая.\n\n4. Вторая.",
  );
  const single: ReadingDose = { ...dose, from: 3, to: 3, text: "3. Единственная." };
  assert.match(readingDose(single, 7, 128), /Книга II, §3 · доза 7\/128/);
});

test("reading finale names the total doses", () => {
  assert.match(readingFinale(128), /Все 128 доз пройдены/);
});

test("splitLongMessage keeps sentences intact and respects the limit", () => {
  const short = "Короткая мысль.";
  assert.deepEqual(splitLongMessage(short), [short]);
  const sentence = "Стоическая мысль о том, что всё проходит. ".repeat(200).trim();
  const parts = splitLongMessage(sentence, 3900);
  assert.ok(parts.length > 1);
  assert.ok(parts.every((part) => part.length <= 3900));
  for (const part of parts) {
    assert.ok(part.endsWith("."));
  }
});
