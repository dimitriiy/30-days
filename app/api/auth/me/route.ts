import { NextResponse, NextRequest } from "next/server";

import { databaseService } from "../../run/db";
import { withAuth } from "../withAuth";

// GET /api/me
export const GET = withAuth(async (req, session) => {
  const user = await databaseService.getUserById(+session.userId);

  return NextResponse.json({
    data: user,
  });
});
