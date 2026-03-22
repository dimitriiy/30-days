import type { Session } from "../../entities/user/User";

export interface SessionRepository {
  create(session: Session): Promise<void>;
  findByToken(token: string): Promise<Session | null>;
}
