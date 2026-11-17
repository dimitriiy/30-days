import path from "path";

import { JSONFilePreset } from "lowdb/node";

import type { Session, User } from "@/entities/user/model/types";

export const DB_PATH = path.join(process.cwd(), "db.json");

interface Data {
  users: Record<string, User>;
  sessions: Record<string, Session>;
  subscribers: number[];
  workoutProgress?: Record<string, Record<string, { done: boolean; comment: string }>>;
}

const defaultData: Data = {
  users: {},
  sessions: {},
  subscribers: [],
  workoutProgress: {},
};

export type JsonDb = Awaited<ReturnType<typeof JSONFilePreset<Data>>>;

let dbPromise: Promise<JsonDb> | null = null;

export async function ensureJsonStore(): Promise<JsonDb> {
  if (!dbPromise) {
    dbPromise = JSONFilePreset<Data>(DB_PATH, defaultData).then((db) => {
      console.log("db is ready");
      return db;
    });
  }
  return dbPromise;
}
