import { NextResponse, type NextRequest } from "next/server";
import { promises as fs } from "fs";

import { z } from "zod";

import { databaseService } from "../db";
import { withAuth } from "../../auth/withAuth";

export const GET = withAuth(async (req, session) => {
  const data = await databaseService.getPrograms();

  return NextResponse.json(data);
});

const editRunSchema = z.object({
  id: z.number(),
  date: z.string(),
  program: z.string().min(1, "План не может быть пустым"),
  distance: z.number().min(0, "Минимум - 0км"),
});

export async function PUT(request: NextRequest) {
  try {
    const json = (await request.json()) as Partial<typeof editRunSchema>;
    const data = editRunSchema.parse(json);

    await databaseService.updateProgramById(data.id, data);

    const allPrograms = await databaseService.getPrograms();

    return NextResponse.json(
      { success: true, data: allPrograms },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Ошибка валидации",
          issues: error.flatten(),
        },
        { status: 400 },
      );
    }

    console.error("PUT /api/run/edit error", error);

    return NextResponse.json(
      { success: false, message: "Внутренняя ошибка сервера" },
      { status: 500 },
    );
  }
}
