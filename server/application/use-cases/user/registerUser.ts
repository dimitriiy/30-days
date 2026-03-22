import bcrypt from "bcrypt";

import type { UserRepository } from "@/server/domain/repositories/user/UserRepository";

export type RegisterUserResult =
  | { ok: true }
  | { ok: false; reason: "email_taken" };

export async function registerUser(
  users: UserRepository,
  input: { email: string; username: string; password: string },
): Promise<RegisterUserResult> {
  const existing = await users.findByEmail(input.email);
  if (existing) {
    return { ok: false, reason: "email_taken" };
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  await users.create({
    email: input.email,
    username: input.username,
    passwordHash,
  });
  return { ok: true };
}
