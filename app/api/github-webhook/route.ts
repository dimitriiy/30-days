import { spawn } from "node:child_process";
import { createHmac, timingSafeEqual } from "node:crypto";
import { resolve } from "node:path";

import { NextResponse } from "next/server";

export const runtime = "nodejs";

const DEPLOY_SCRIPT = resolve(process.cwd(), "deploy.sh");

function isValidSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret || !signature) return false;

  const expected =
    "sha256=" + createHmac("sha256", secret).update(rawBody).digest("hex");
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  return (
    actualBuffer.length === expectedBuffer.length &&
    timingSafeEqual(actualBuffer, expectedBuffer)
  );
}

export async function POST(request: Request): Promise<NextResponse> {
  const rawBody = await request.text();
  const signature = request.headers.get("x-hub-signature-256");

  if (!isValidSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  if (request.headers.get("x-github-event") !== "push") {
    return NextResponse.json({ ok: true });
  }

  const child = spawn("bash", [DEPLOY_SCRIPT], {
    detached: true,
    stdio: "ignore",
    env: process.env,
  });

  child.on("error", (error) => {
    console.error("Failed to start deploy script", error);
  });
  child.unref();

  return NextResponse.json({ ok: true, deployed: true });
}
