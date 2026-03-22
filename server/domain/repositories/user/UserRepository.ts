import type { User } from "../../entities/user/User";

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  getById(id: number): Promise<User | null>;
  create(user: Omit<User, "id">): Promise<void>;
}
