import path from "path";
import { copyFile, mkdir } from "fs/promises";

export async function backupDatabase() {
  const folder = path.join(process.cwd(), "backups", `${Date.now()}`);

  await mkdir(folder, { recursive: true });
  await copyFile(path.join(process.cwd(), "db.json"), path.join(folder, "db.json"));
  try {
    await copyFile(path.join(process.cwd(), "bot-data.json"), path.join(folder, "bot-data.json"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
}
