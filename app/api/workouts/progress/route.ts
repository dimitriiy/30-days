import { NextResponse } from "next/server";
import { z } from "zod";

import { withAuth } from "@/app/api/auth/withAuth";
import { ensureJsonStore } from "@/server/infrastructure/persistence/json/json-store";
import { updateUserProgress, userProgress } from "@/server/workouts/progress";

let writes = Promise.resolve();
const input = z.object({ id: z.number().int().min(1).max(30), done: z.boolean(), comment: z.string().max(2000) });

export const GET = withAuth(async (_request, session) => {
  await writes;
  const db = await ensureJsonStore();
  return NextResponse.json(userProgress(db.data.workoutProgress, Number(session.userId)));
});

export const PUT = withAuth(async (request, session) => {
  const parsed = input.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
  const { id, done, comment } = parsed.data;
  const save = writes.then(async () => {
    const db = await ensureJsonStore();
    await db.update((data) => {
      data.workoutProgress ??= {};
      updateUserProgress(data.workoutProgress, Number(session.userId), id, { done, comment });
    });
  });
  writes = save.then(() => undefined, () => undefined);
  await save;
  return NextResponse.json({ done, comment });
});
