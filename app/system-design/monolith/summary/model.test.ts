import assert from "node:assert/strict";
import test from "node:test";
import { blocks, selectedText } from "./model";
import { parseSelection } from "./storage";

test("exports selected items with their original context and answers", () => {
  const item = blocks.flatMap(block => block.topics.flatMap(topic => topic.sections.flatMap(section => section.items))).find(entry => entry.answer);
  assert.ok(item);
  const result = selectedText([item.id]);
  assert.match(result, /Вопросы и ответы/);
  assert.ok(result.includes(item.text));
  assert.ok(result.includes(item.answer!));
  assert.equal(selectedText([]), "");
});

test("selection parsing tolerates invalid or unexpected stored values", () => {
  assert.deepEqual(parseSelection("broken"), []);
  assert.deepEqual(parseSelection('["one", 2, null]'), ["one"]);
});

test("all items have unique stable ids", () => {
  const ids = blocks.flatMap(block => block.topics.flatMap(topic => topic.sections.flatMap(section => section.items.map(item => item.id))));
  assert.equal(ids.length, 241);
  assert.equal(new Set(ids).size, ids.length);
});
