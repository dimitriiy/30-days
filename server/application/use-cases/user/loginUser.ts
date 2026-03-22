import bcrypt from "bcrypt";

import type { Session } from "@/server/domain/entities/user/User";
import type { SessionRepository } from "@/server/domain/repositories/user/SessionRepository";
import type { UserRepository } from "@/server/domain/repositories/user/UserRepository";

import { createSession } from "@/server/application/user/sessionFactory";

export type LoginUserResult =
  | { ok: true; session: Session }
  | { ok: false; reason: "user_not_found" | "invalid_password" };

export async function loginUser(
  users: UserRepository,
  sessions: SessionRepository,
  input: { email: string; password: string },
): Promise<LoginUserResult> {
  const user = await users.findByEmail(input.email);
  if (!user) {
    return { ok: false, reason: "user_not_found" };
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) {
    return { ok: false, reason: "invalid_password" };
  }

  const session = createSession(user.id);
  await sessions.create(session);
  return { ok: true, session };
}
