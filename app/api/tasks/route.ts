import { NextResponse, NextRequest } from "next/server";

import pool from "@/lib/db";

// GET /api/users
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

  return NextResponse.json(
    { message: "Пользователь создан", data: body },
    { status: 201 }
  );
}
