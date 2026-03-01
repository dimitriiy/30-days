import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { SESSION_TOKEN_KEY } from "./app/api/auth/consts";

const publicPaths = ["/api/"];

function isPublicPath(pathname: string): boolean {
  return publicPaths.some((p) => pathname.startsWith(p));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/api/auth/login" || pathname === "/api/auth/register") {
    return NextResponse.next();
  }
  if (!isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const store = await cookies();
  const cooka = store.get(SESSION_TOKEN_KEY);

  if (!cooka?.value) {
    store.delete(SESSION_TOKEN_KEY);
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*", "/dashboard/:path*", "/profile/:path*"],
};
