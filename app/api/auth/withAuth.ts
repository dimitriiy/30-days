// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { validateSession } from "./login/session";

type SessionData = { userId: string; name: string; [key: string]: unknown };

type AuthedHandler = (
  req: NextRequest,
  session: SessionData,
) => Promise<NextResponse> | NextResponse;

export function withAuth(handler: AuthedHandler) {
  return async (req: NextRequest) => {
    const result = await validateSession();

    if (!result) {
      return NextResponse.json({ error: result }, { status: 401 });
    }

    // Вызываем оригинальный handler, пробрасывая session
    return handler(req, result);
  };
}
