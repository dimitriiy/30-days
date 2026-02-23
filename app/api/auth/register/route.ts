import { NextResponse, NextRequest } from "next/server";
import bcrypt from "bcrypt";

import pool from "@/lib/db";

// GET /api/usersnpm
export async function GET() {
  //   const client = await pool.connect();

  const users = await pool.query(
    "SELECT * FROM users ORDER BY created_at DESC"
  );

  return NextResponse.json(users.rows);
}

// POST /api/users
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, password, username } = body;

  const existingUser = await pool.query(
    "SELECT id FROM users WHERE email = $1",
    [email]
  );

  if (existingUser.rows?.length) {
    return NextResponse.json(
      { message: "Пользователь уже существует", data: existingUser },
      { status: 401 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const result = await pool.query(
    `INSERT INTO users (email, password_hash, username, created_at)
       VALUES ($1, $2, $3, NOW())
       RETURNING id, email, username, created_at`,
    [email, hashedPassword, username]
  );

  return NextResponse.json({ message: "Пользователь создан" }, { status: 201 });
}
