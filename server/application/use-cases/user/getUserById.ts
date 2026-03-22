import type { User } from "@/server/domain/entities/user/User";
import type { UserRepository } from "@/server/domain/repositories/user/UserRepository";

export async function getUserById(
  users: UserRepository,
  id: number,
): Promise<User | null> {
  return users.getById(id);
}
