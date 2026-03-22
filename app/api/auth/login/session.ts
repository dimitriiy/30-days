import { cookies } from "next/headers";

import { ensureJsonStore } from "@/server/infrastructure/persistence/json/json-store";
import { jsonSessionRepository } from "@/server/infrastructure/repositories/user/JsonSessionRepository";

import { SESSION_TOKEN_KEY } from "../consts";

export {
  createSession,
  generateSessionToken,
} from "@/server/application/user/sessionFactory";

export async function validateSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_TOKEN_KEY)?.value;

  if (!token) return null;

  await ensureJsonStore();
  return jsonSessionRepository.findByToken(token);
}
