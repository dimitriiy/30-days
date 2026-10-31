import "dotenv/config";

import { startScheduledJobs } from "./scheduler";
import { startBot } from "./telegram";

async function main(): Promise<void> {
  const bot = await startBot();
  startScheduledJobs(bot);
  console.log("telegram bot started");
}

main().catch((error) => {
  console.error("bot failed to start:", error);
  process.exit(1);
});
