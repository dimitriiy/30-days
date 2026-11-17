import assert from "node:assert/strict";
import { test } from "node:test";

import { createScreenAwake } from "./use-screen-awake";

test("screen wake starts on demand and releases on pause", async () => {
  let enableCount = 0;
  let disableCount = 0;
  const wake = createScreenAwake(() => ({
    enable: async () => { enableCount++; },
    disable: () => { disableCount++; },
  }));

  assert.equal(enableCount, 0);
  wake.preventSleep();
  assert.equal(enableCount, 1);
  await Promise.resolve();
  wake.allowSleep();
  assert.equal(disableCount, 1);
});

test("a late wake response cannot keep the screen awake after a pause", async () => {
  let finishEnable!: () => void;
  let disableCount = 0;
  const wake = createScreenAwake(() => ({
    enable: () => new Promise<void>((resolve) => { finishEnable = resolve; }),
    disable: () => { disableCount++; },
  }));

  wake.preventSleep();
  wake.allowSleep();
  finishEnable();
  await Promise.resolve();
  assert.equal(disableCount, 2);
});

test("unavailable wake lock does not prevent the timer from starting", () => {
  const wake = createScreenAwake(() => { throw new Error("unsupported"); });
  assert.doesNotThrow(() => wake.preventSleep());
  assert.doesNotThrow(() => wake.allowSleep());
});
