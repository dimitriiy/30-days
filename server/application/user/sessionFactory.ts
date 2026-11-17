import crypto from "crypto";

import type { Session } from "@/server/domain/entities/user/User";

export function isSessionActive(session: Session | null, now = Date.now()): session is Session {
  return session !== null && session.expiresAt > now;
}

export function generateSessionToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function createSession(
  userId: number,
  data: Record<string, unknown> = {},
  ttlMs = 1000 * 60 * 60 * 24 * 7,
): Session {
  const token = generateSessionToken();
  const expiresAt = Date.now() + ttlMs;

  return {
    userId,
    token,
    expiresAt,
    data,
  };
}
