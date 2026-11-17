import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";

// Simulate a second server process writing a user after this one loaded db.json.
test("sees users written by another process", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "json-store-test-"));
  const previousCwd = process.cwd();
  try {
    process.chdir(directory);
    const { ensureJsonStore, DB_PATH } = await import("./json-store");
    const db = await ensureJsonStore();
    const user = { id: 1, email: "a@b.c", passwordHash: "x", username: "a" };
    await writeFile(DB_PATH, JSON.stringify({ ...db.data, users: { "1": user } }));

    assert.deepEqual((await ensureJsonStore()).data.users["1"], user);
  } finally {
    process.chdir(previousCwd);
    await rm(directory, { recursive: true, force: true });
  }
});
