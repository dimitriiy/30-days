import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { AUTH_TOKEN_KEY } from "../consts";
import { withAuth } from "../withAuth";

// Stateless JWTs cannot be revoked; logging out removes this browser's cookie.
export const POST = withAuth(async () => {
  (await cookies()).delete(AUTH_TOKEN_KEY);
  return NextResponse.json({ logout: true });
});
