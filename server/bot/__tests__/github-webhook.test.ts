import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { after, before, test } from "node:test";

import { POST } from "../../../app/api/github-webhook/route";

const originalSecret = process.env.GITHUB_WEBHOOK_SECRET;
const secret = "test-webhook-secret";
const body = JSON.stringify({ ref: "refs/heads/master" });

before(() => {
  process.env.GITHUB_WEBHOOK_SECRET = secret;
});

after(() => {
  if (originalSecret === undefined) {
    delete process.env.GITHUB_WEBHOOK_SECRET;
  } else {
    process.env.GITHUB_WEBHOOK_SECRET = originalSecret;
  }
});

function createRequest(signature: string | null, event = "push"): Request {
  const headers = new Headers({ "x-github-event": event });
  if (signature) headers.set("x-hub-signature-256", signature);

  return new Request("http://localhost/api/github-webhook", {
    method: "POST",
    headers,
    body,
  });
}

test("rejects requests without a valid signature", async () => {
  const missing = await POST(createRequest(null));
  const invalid = await POST(createRequest("sha256=invalid"));

  assert.equal(missing.status, 401);
  assert.equal(invalid.status, 401);
});

test("accepts signed non-push events without deploying", async () => {
  const signature =
    "sha256=" + createHmac("sha256", secret).update(body).digest("hex");
  const response = await POST(createRequest(signature, "ping"));

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
});
