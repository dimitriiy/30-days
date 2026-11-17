export type UserRole = "admin" | "user";

export type User = {
  id: number;
  email: string;
  passwordHash: string;
  username: string;
  role?:UserRole
};
