import assert from "node:assert/strict";
import { test } from "node:test";
import { allAnswered, questions, scoreAnswers, type Answers } from "./questions";

test("all 23 lessons covered by unique, valid single-choice questions", () => {
  assert.equal(questions.length, 50);
  assert.deepEqual([...new Set(questions.map(q => q.lesson))].sort((a, b) => a - b), Array.from({ length: 23 }, (_, i) => i + 1));
  assert.equal(new Set(questions.map(q => q.id)).size, questions.length);
  for (const q of questions) {
    assert.equal(q.options.length, 4);
    assert.equal(new Set(q.options).size, q.options.length);
    assert.ok(Number.isInteger(q.correct) && q.correct >= 0 && q.correct < q.options.length);
  }
});

test("missing or invalid answers cannot complete the test, including index zero", () => {
  assert.equal(allAnswered({}), false);
  assert.equal(scoreAnswers({}), 0);
  const answers: Answers = Object.fromEntries(questions.map(q => [q.id, 0]));
  assert.equal(allAnswered(answers), true);
  answers[questions[0].id] = 4;
  assert.equal(allAnswered(answers), false);
  delete answers[questions[0].id];
  assert.equal(allAnswered(answers), false);
});

test("score is exact and unrelated IDs do not contribute", () => {
  const answers: Answers = Object.fromEntries(questions.map(q => [q.id, q.correct]));
  assert.equal(scoreAnswers(answers), questions.length);
  answers[questions[0].id] = (questions[0].correct + 1) % 4;
  answers.unknown = 1;
  assert.equal(scoreAnswers(answers), questions.length - 1);
  assert.equal(allAnswered(answers), true);
});

test("every question has a focused explanation covering the answer and its context", async () => {
  const { explanations } = await import("./explanations");
  assert.deepEqual(Object.keys(explanations).sort(), questions.map(question => question.id).sort());
  for (const question of questions) {
    const paragraphs = explanations[question.id];
    assert.equal(paragraphs.length, 2);
    assert.ok(paragraphs.every(paragraph => paragraph.length >= 80));
    assert.ok(paragraphs.every(paragraph => !/в курсе мы|в этом уроке/i.test(paragraph)));
  }
});
