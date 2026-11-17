import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";

// Simulate a second server process writing a session after this one loaded db.json.
test("sees sessions written by another process", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "json-store-test-"));
  const previousCwd = process.cwd();
  try {
    process.chdir(directory);
    const { ensureJsonStore, DB_PATH } = await import("./json-store");
    const db = await ensureJsonStore();
    const session = { token: "new-session", userId: 1, expiresAt: Date.now() + 60_000, data: {} };
    await writeFile(DB_PATH, JSON.stringify({ ...db.data, sessions: { [session.token]: session } }));

    assert.deepEqual((await ensureJsonStore()).data.sessions[session.token], session);
  } finally {
    process.chdir(previousCwd);
    await rm(directory, { recursive: true, force: true });
  }
});
