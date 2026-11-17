import path from "path";

import { JSONFilePreset } from "lowdb/node";

import type { User } from "@/entities/user/model/types";

export const DB_PATH = path.join(process.cwd(), "db.json");

interface Data {
  users: Record<string, User>;
  subscribers: number[];
  workoutProgress?: Record<string, Record<string, { done: boolean; comment: string }>>;
}

const defaultData: Data = {
  users: {},
  subscribers: [],
  workoutProgress: {},
};

export type JsonDb = Awaited<ReturnType<typeof JSONFilePreset<Data>>>;

let dbPromise: Promise<JsonDb> | null = null;

export async function ensureJsonStore(): Promise<JsonDb> {
  dbPromise ??= JSONFilePreset<Data>(DB_PATH, defaultData);
  const db = await dbPromise;
  // Other server processes can update db.json between requests.
  await db.read();
  return db;
}
