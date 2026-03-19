import crypto from "crypto";
import { type Session } from "./route";
import { cookies } from "next/headers";
import { databaseService } from "../../run/db";
import { SESSION_TOKEN_KEY } from "../consts";

export function generateSessionToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function createSession(
  userId: number,
  data = {},
  ttlMs = 60 * 60 * 24 * 7,
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

export async function validateSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_TOKEN_KEY)?.value;

  if (!token) return null;

  const session = await databaseService.checkSession(token);

  return session;
}
