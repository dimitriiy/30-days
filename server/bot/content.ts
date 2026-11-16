import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

import type { ReadingDose } from "./domain";

const ROOT = path.join(process.cwd(), "mark-quotes");
let morningPromise: Promise<string> | null = null;
let quotesPromise: Promise<string[]> | null = null;

export async function morningMessage(): Promise<string> {
  morningPromise ??= readFile(path.join(ROOT, "morning", "morning.txt"), "utf8")
    .then((text) => text.trim())
    .catch((error) => {
      morningPromise = null;
      throw error;
    });
  return morningPromise;
}

let dosesPromise: Promise<ReadingDose[]> | null = null;

export async function readingDoses(): Promise<ReadingDose[]> {
  dosesPromise ??= (async () => {
    const folder = path.join(ROOT, "reading");
    const names = (await readdir(folder)).filter((name) => name.endsWith(".txt")).sort();
    return Promise.all(names.map(async (name) => {
      const match = /^(\d{2})-(\d{2})(?:-(\d{2}))?\.txt$/.exec(name);
      if (!match) throw new Error(`unexpected reading file name: ${name}`);
      const [, book, from, to] = match;
      const text = (await readFile(path.join(folder, name), "utf8")).trim();
      return { book: Number(book), from: Number(from), to: Number(to ?? from), text };
    }));
  })().catch((error) => {
    dosesPromise = null;
    throw error;
  });
  return dosesPromise;
}

export async function dailyQuotes(): Promise<string[]> {
  quotesPromise ??= (async () => {
    const folder = path.join(ROOT, "day");
    const files = (await readdir(folder)).filter((name) => name.endsWith(".txt")).sort();
    return Promise.all(files.map(async (name) => (await readFile(path.join(folder, name), "utf8")).trim()));
  })().catch((error) => {
    quotesPromise = null;
    throw error;
  });
  return quotesPromise;
}
