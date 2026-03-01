import { NextResponse, type NextRequest } from "next/server";

import { databaseService } from "../db";

type DoneItem = {
  id: number;
  done: boolean;
};

export async function GET() {
  const data = await databaseService.getDone();

  return NextResponse.json(data);
}

export async function PUT(request: NextRequest) {
  try {
    const { id, done } = (await request.json()) as DoneItem;

    if (done) {
      await databaseService.addDone(id);
    } else {
      await databaseService.unDone(id);
    }

    const allDones = await databaseService.getDone();

    return NextResponse.json(
      { success: true, data: allDones },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Внутренняя ошибка сервера" },
      { status: 500 },
    );
  }
}
