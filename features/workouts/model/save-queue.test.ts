import assert from "node:assert/strict";
import { test } from "node:test";

import { enqueueSave } from "./save-queue";

test("rapid saves run in order so the latest comment wins", async () => {
  const order: string[] = [];
  let release!: () => void;
  let notifyStarted!: () => void;
  const started = new Promise<void>((resolve) => { notifyStarted = resolve; });
  const first = enqueueSave(Promise.resolve(), async () => {
    order.push("first");
    notifyStarted();
    await new Promise<void>((resolve) => { release = resolve; });
    return true;
  });
  const second = enqueueSave(first, async () => { order.push("latest"); return true; });
  await started;
  assert.deepEqual(order, ["first"]);
  release();
  await second;
  assert.deepEqual(order, ["first", "latest"]);
});

test("a failed save does not block the next edit", async () => {
  const result = enqueueSave(Promise.reject(new Error("offline")), async () => true);
  assert.equal(await result, true);
});
