import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";

import { signToken } from "@/server/application/user/token";
import { loginUser } from "@/server/application/use-cases/user/loginUser";
import { ensureJsonStore } from "@/server/infrastructure/persistence/json/json-store";
import { jsonUserRepository } from "@/server/infrastructure/repositories/user/JsonUserRepository";
import { AUTH_TOKEN_KEY } from "../consts";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    await ensureJsonStore();
    const result = await loginUser(jsonUserRepository, { email, password });

    if (!result.ok) {
      if (result.reason === "user_not_found") {
        return NextResponse.json(
          { message: "Пользователя не существует" },
          { status: 404 },
        );
      }

      return NextResponse.json(
        { message: "Неверный пароль пес!" },
        { status: 401 },
      );
    }

    const store = await cookies();

    store.set(AUTH_TOKEN_KEY, signToken(result.userId), {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
      sameSite: "lax",
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
