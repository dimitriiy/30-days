import { NextResponse, NextRequest } from "next/server";
import bcrypt from "bcrypt";

import pool from "@/lib/db";
import { databaseService } from "../../run/db";

export type User = {
  id: number;
  email: string;
  passwordHash: string;
  username: string;
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

    if (existingUser) {
      return NextResponse.json(
        { message: "Пользователь уже существует", data: existingUser },
        { status: 401 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await databaseService.createUser({
      email,
      username,
      passwordHash: hashedPassword,
    });

    return NextResponse.json(
      { message: "Пользователь создан" },
      { status: 201 },
    );
  } catch (e) {
    return NextResponse.json({ message: e }, { status: 500 });
  }
}
