import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

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
