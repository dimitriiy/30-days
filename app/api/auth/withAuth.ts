import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/server/application/user/token";
import { AUTH_TOKEN_KEY } from "./consts";

export async function validateAuth(): Promise<number | null> {
  const token = (await cookies()).get(AUTH_TOKEN_KEY)?.value;
  return token ? verifyToken(token) : null;
}

type AuthedHandler = (
  req: NextRequest,
  userId: number,
) => Promise<NextResponse> | NextResponse;

export function withAuth(handler: AuthedHandler) {
  return async (req: NextRequest) => {
    const userId = await validateAuth();

    if (userId === null) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    return handler(req, userId);
  };
}
