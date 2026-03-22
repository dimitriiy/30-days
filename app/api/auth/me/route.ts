import { NextResponse } from "next/server";

import { getUserById } from "@/server/application/use-cases/user/getUserById";
import { ensureJsonStore } from "@/server/infrastructure/persistence/json/json-store";
import { jsonUserRepository } from "@/server/infrastructure/repositories/user/JsonUserRepository";
import { withAuth } from "../withAuth";

export const GET = withAuth(async (_req, session) => {
  await ensureJsonStore();
  const user = await getUserById(jsonUserRepository, +session.userId);

  return NextResponse.json({
    data: user,
  });
});
