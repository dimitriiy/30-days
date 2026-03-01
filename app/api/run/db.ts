import path from "path";

import { JSONFilePreset } from "lowdb/node";
import type { User } from "../auth/register/route";

import type { Session } from "../auth/login/route";

const DB_PATH = path.join(process.cwd(), "app/api/run/db.json");

interface Program {
  date: string;
  day: number;
  program: string;
  distance: number;
  id: number;
}

interface Data {
  programs: Program[];
  done: number[];
  users: Record<string, User>;
  sessions: Record<string, Session>;
}

const defaultData: Data = {
  programs: [],
  done: [],
  users: {},
  sessions: {},
};

class DatabaseService {
  private db: Awaited<ReturnType<typeof JSONFilePreset<Data>>> | null = null;

  constructor() {
    this.init();
  }

  async init(filePath: string = DB_PATH): Promise<this> {
    this.db = await JSONFilePreset<Data>(filePath, defaultData);
    console.log("db is ready");
    return this;
  }

  private ensureDb(): Awaited<ReturnType<typeof JSONFilePreset<Data>>> {
    if (!this.db) {
      throw new Error("Database not initialized. Call init() first.");
    }
    return this.db;
  }

  getPrograms(): Program[] {
    return this.ensureDb().data.programs;
  }

  getProgramById(id: number): Program | undefined {
    return this.ensureDb().data.programs.find((p) => p.id === id);
  }

  async updateProgramById(
    id: number,
    updates: Partial<Omit<Program, "id">>,
  ): Promise<void> {
    const db = this.ensureDb();
    await db.update(({ programs }) => {
      const program = programs.find((p) => p.id === id);
      if (!program) {
        throw new Error(`Program with id ${id} not found`);
      }
      Object.assign(program, updates);
    });
  }

  async updateDone(doneList: number[]): Promise<void> {
    const db = this.ensureDb();
    await db.update((data) => {
      data.done = doneList;
    });
  }

  async unDone(id: number): Promise<void> {
    const db = this.ensureDb();
    await db.update((data) => {
      if (data.done.includes(id)) {
        data.done = data.done.filter((item) => item !== id);
      }
    });
  }

  async addDone(id: number): Promise<void> {
    const db = this.ensureDb();
    await db.update((data) => {
      if (!data.done.includes(id)) {
        data.done.push(id);
      }
    });
  }

  getDone(): number[] {
    return this.ensureDb().data.done;
  }

  findUser(email: string) {
    return Object.values(this.ensureDb().data.users).find(
      (user) => user.email === email,
    );
  }

  async createUser(user: Omit<User, "id">) {
    const db = this.ensureDb();
    const id = generateId();

    await db.update((data) => {
      data.users[id] = { ...user, id };
    });
  }

  async createSession(session: Session) {
    const db = this.ensureDb();

    await db.update((data) => {
      console.log("sessions", data);
      data.sessions[session.token] = session;
    });
  }

  async checkSession(id: string) {
    return this.ensureDb().data.sessions[id] ?? null;
  }

  getUsers() {
    return this.ensureDb().data.users;
  }
  getUserById(id: number) {
    return this.ensureDb().data.users[id] ?? null;
  }
}

export const databaseService = new DatabaseService();

function generateId() {
  return Math.floor(Math.random() * 100000000);
}
