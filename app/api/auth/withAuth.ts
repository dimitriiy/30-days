import { type NextRequest, NextResponse } from "next/server";
import type { Session } from "@/entities/user/model/types";
import { validateSession } from "./login/session";

type AuthedHandler = (
  req: NextRequest,
  session: Session,
) => Promise<NextResponse> | NextResponse;

export function withAuth(handler: AuthedHandler) {
  return async (req: NextRequest) => {
    const result = await validateSession();

    if (!result) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    return handler(req, result);
  };
}
