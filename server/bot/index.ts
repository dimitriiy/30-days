import "dotenv/config";

import { startScheduledJobs } from "@/server/bot/cron-jobs";
import { startBot } from "@/server/bot/telegram";

async function main() {
  startScheduledJobs();
  await startBot();
}

main().catch((err) => {
  console.error("bot failed to start:", err);
  process.exit(1);
});
