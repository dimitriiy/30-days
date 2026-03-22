export type UserRole = "admin" | "user";

export type User = {
  id: number;
  email: string;
  passwordHash: string;
  username: string;
  role?:UserRole
};

export type Session = {
  token: string;
  userId: number;
  expiresAt: number;
  data?: Record<string, unknown>;
};
