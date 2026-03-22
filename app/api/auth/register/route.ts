import { NextResponse, NextRequest } from "next/server";

import { registerUser } from "@/server/application/use-cases/user/registerUser";
import { ensureJsonStore } from "@/server/infrastructure/persistence/json/json-store";
import { jsonUserRepository } from "@/server/infrastructure/repositories/user/JsonUserRepository";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, username } = body;

    await ensureJsonStore();
    const result = await registerUser(jsonUserRepository, {
      email,
      password,
      username,
    });

    if (!result.ok) {
      return NextResponse.json(
        { message: "Пользователь уже существует" },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { message: "Пользователь создан" },
      { status: 201 },
    );
  } catch (e) {
    return NextResponse.json({ message: e }, { status: 500 });
  }
}
