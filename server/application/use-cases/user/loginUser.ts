import bcrypt from "bcrypt";

import type { UserRepository } from "@/server/domain/repositories/user/UserRepository";


export type LoginUserResult =
  | { ok: true; userId: number }
  | { ok: false; reason: "user_not_found" | "invalid_password" };

export async function loginUser(
  users: UserRepository,
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

  return { ok: true, userId: user.id };
}
