import { NextResponse, type NextRequest } from "next/server";

import { z } from "zod";

import { getProgramsWithDone } from "@/server/application/use-cases/programs/getProgramsWithDone";
import { toggleProgramDone } from "@/server/application/use-cases/programs/toggleProgramDone";
import { updateProgram } from "@/server/application/use-cases/programs/updateProgram";
import { ensureJsonStore } from "@/server/infrastructure/persistence/json/json-store";
import { jsonDoneRepository } from "@/server/infrastructure/repositories/programs/JsonDoneRepository";
import { jsonProgramRepository } from "@/server/infrastructure/repositories/programs/JsonProgramRepository";

import { withAuth } from "../../auth/withAuth";

export const GET = withAuth(async () => {
  await ensureJsonStore();
  const data = await getProgramsWithDone(
    jsonProgramRepository,
    jsonDoneRepository,
  );
  return NextResponse.json(data);
});

const editRunSchema = z.object({
  id: z.number(),
  date: z.string(),
  program: z.string().min(1, "План не может быть пустым"),
  distance: z.number().min(0, "Минимум - 0км"),
});

const toggleDoneSchema = z.object({
  id: z.number(),
  done: z.boolean(),
});

export async function PUT(request: NextRequest) {
  try {
    const payload = await request.json();
    const editParsed = editRunSchema.safeParse(payload);
    await ensureJsonStore();

    if (editParsed.success) {
      await updateProgram(jsonProgramRepository, editParsed.data);
    } else {
      const doneParsed = toggleDoneSchema.safeParse(payload);

      if (!doneParsed.success) {
        return NextResponse.json(
          {
            error: {
              code: "validation_error",
              message: "Ошибка валидации",
              issues: {
                edit: editParsed.error.flatten(),
                done: doneParsed.error.flatten(),
              },
            },
            message: "Ошибка валидации",  
            issues: {
              edit: editParsed.error.flatten(),
              done: doneParsed.error.flatten(),
            },
          },
          { status: 400 },
        );
      }

      await toggleProgramDone(jsonDoneRepository, doneParsed.data);
    }

    const programsWithDone = await getProgramsWithDone(
      jsonProgramRepository,
      jsonDoneRepository,
    );

    return NextResponse.json(
      { success: true, data: programsWithDone },
      { status: 200 },
    );
  } catch (error) {
    console.error("PUT /api/run/programs error", error);

    return NextResponse.json(
      { success: false, message: "Внутренняя ошибка сервера" },
      { status: 500 },
    );
  }
}
