import path from "path";
import { copyFile, mkdir } from "fs/promises";

export async function backupDatabase() {
  const file = path.join(process.cwd(), "db.json");
  const dest = path.join(process.cwd(), "backups", `${Date.now}`, `db.json`);

  await mkdir(path.dirname(dest), { recursive: true });
  await copyFile(file, dest);
}
