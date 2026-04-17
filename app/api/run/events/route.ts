import { NextResponse, type NextRequest } from "next/server";

import { z } from "zod";

import { createRunEvent } from "@/server/application/use-cases/run-events/createRunEvent";
import { deleteRunEvent } from "@/server/application/use-cases/run-events/deleteRunEvent";
import { getRunEvents } from "@/server/application/use-cases/run-events/getRunEvents";
import { updateRunEvent } from "@/server/application/use-cases/run-events/updateRunEvent";
import { ensureJsonStore } from "@/server/infrastructure/persistence/json/json-store";
import { jsonRunEventRepository } from "@/server/infrastructure/repositories/run-event/JsonRunEventRepository";

import { withAuth } from "../../auth/withAuth";

// GET - returns all run events sorted by date (auth-protected)
export const GET = withAuth(async () => {
  await ensureJsonStore();
  const data = await getRunEvents(jsonRunEventRepository);
  return NextResponse.json(data);
});

// POST - create a new run event
const createEventSchema = z.object({
  date: z.string().min(1, "Дата обязательна"),
  name: z.string().min(1, "Название обязательно"),
  location: z.string().min(1, "Локация обязательна"),
  pic: z.string().optional(),
});

export const POST = withAuth(async (req: NextRequest) => {
  try {
    const payload = await req.json();
    const parsed = createEventSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "validation_error", issues: parsed.error.flatten() } },
        { status: 400 },
      );
    }

    await ensureJsonStore();
    const created = await createRunEvent(jsonRunEventRepository, parsed.data);

    return NextResponse.json(
      { success: true, data: created },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/run/events error", error);
    return NextResponse.json(
      { success: false, message: "Внутренняя ошибка сервера" },
      { status: 500 },
    );
  }
});

// PUT - update an existing run event
const updateEventSchema = z.object({
  id: z.number(),
  date: z.string().min(1, "Дата обязательна"),
  name: z.string().min(1, "Название обязательно"),
  location: z.string().min(1, "Локация обязательна"),
  pic: z.string().optional(),
});

export const PUT = withAuth(async (req: NextRequest) => {
  try {
    const payload = await req.json();
    const parsed = updateEventSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "validation_error", issues: parsed.error.flatten() } },
        { status: 400 },
      );
    }

    await ensureJsonStore();
    await updateRunEvent(jsonRunEventRepository, parsed.data);
    const events = await getRunEvents(jsonRunEventRepository);

    return NextResponse.json(
      { success: true, data: events },
      { status: 200 },
    );
  } catch (error) {
    console.error("PUT /api/run/events error", error);
    return NextResponse.json(
      { success: false, message: "Внутренняя ошибка сервера" },
      { status: 500 },
    );
  }
});

// DELETE - remove a run event by id
const deleteEventSchema = z.object({
  id: z.number(),
});

export const DELETE = withAuth(async (req: NextRequest) => {
  try {
    const payload = await req.json();
    const parsed = deleteEventSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "validation_error", issues: parsed.error.flatten() } },
        { status: 400 },
      );
    }

    await ensureJsonStore();
    await deleteRunEvent(jsonRunEventRepository, parsed.data.id);
    const events = await getRunEvents(jsonRunEventRepository);

    return NextResponse.json(
      { success: true, data: events },
      { status: 200 },
    );
  } catch (error) {
    console.error("DELETE /api/run/events error", error);
    return NextResponse.json(
      { success: false, message: "Внутренняя ошибка сервера" },
      { status: 500 },
    );
  }
});
