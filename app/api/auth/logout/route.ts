import { NextResponse } from "next/server";

import { ensureJsonStore } from "@/server/infrastructure/persistence/json/json-store";
import { withAuth } from "../withAuth";
import { cookies } from "next/headers";
import { SESSION_TOKEN_KEY } from "../consts";

export const POST = withAuth(async (_req, session) => {
  try {
    await ensureJsonStore();

    (await cookies()).delete(SESSION_TOKEN_KEY);

    return NextResponse.json({
      logout: true,
    });
  } catch (e) {
    return NextResponse.json(
      { success: false, message: "Ошибка разлогина" },
      { status: 500 },
    );
  }
});
