import { NextResponse, type NextRequest } from "next/server";
import { promises as fs } from "fs";
import path from "path";

import DB from "./db.json";

type DoneItem = {
  date: string;
  done: boolean;
};

type DBShape = {
  done: DoneItem[];
};

const DB_PATH = path.join(process.cwd(), "app/api/run/db.json");

export async function GET() {
  const data: DBShape = DB as DBShape;

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<DoneItem>;
    const { date, done } = body;

    if (!date || typeof done !== "boolean") {
      return NextResponse.json(
        { message: "Invalid body", data: {} },
        { status: 400 },
      );
    }

    // Читаем актуальное состояние файла
    const fileRaw = await fs.readFile(DB_PATH, "utf8");
    const current: DBShape = JSON.parse(fileRaw);

    const cloned: DBShape = {
      done: [...current.done],
    };

    const existing = cloned.done.find((row) => row.date === date);

    if (existing) {
      cloned.done = cloned.done.filter((row) => row.date !== date);
    } else {
      cloned.done.push({ date, done });
    }

    await fs.writeFile(DB_PATH, JSON.stringify(cloned, null, 2), "utf8");

    return NextResponse.json(
      { message: "Ok", data: { date, done } },
      { status: 200 },
    );
  } catch (error) {
    console.error("POST /api/run error:", error);
    return NextResponse.json(
      { message: "Internal Server Error", data: {} },
      { status: 500 },
    );
  }
}
