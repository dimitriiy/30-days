import { NextResponse, NextRequest } from "next/server";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";

import pool from "@/lib/db";
import { databaseService } from "../../run/db";
import { createSession } from "./session";
import { SESSION_TOKEN_KEY } from "../consts";

export type Session = {
  token: string;
  userId: number;
  expiresAt: number;

  data?: any;
};
// GET /api/usersnpm
export async function GET() {
  //   const client = await pool.connect();

  const users = await pool.query(
    "SELECT * FROM users ORDER BY created_at DESC",
  );

  return NextResponse.json(users.rows);
}

// POST /api/users
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, username } = body;

    const existingUser = await databaseService.findUser(email);

    if (!existingUser) {
      return NextResponse.json(
        { message: "Пользователя не существует", data: existingUser },
        { status: 404 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const hashValid = await bcrypt.compare(password, existingUser.passwordHash);

    if (!hashValid) {
      return NextResponse.json(
        { message: "Неверный пароль пес!", data: existingUser },
        { status: 401 },
      );
    }

    const session = createSession(existingUser.id);

    await databaseService.createSession(session);

    const store = await cookies();

    store.set(SESSION_TOKEN_KEY, session.token, {
      httpOnly: true, // Recommended for security

      maxAge: 60 * 60 * 24 * 7, // Cookie expiration (1 week)
      path: "/",
      sameSite: "lax", // Cookie is available site-wide
    });

    return NextResponse.json(
      { data: { message: "User logined!" } },
      { status: 200 },
    );
  } catch (e) {
    return NextResponse.json(
      { message: (e as Error).message },
      { status: 500 },
    );
  }
}
