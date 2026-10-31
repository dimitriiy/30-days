import { spawn } from "node:child_process";

const commands = [
  ["website", ["node_modules/next/dist/bin/next", "dev", "-p", "8080"]],
  ["telegram-bot", ["--import", "tsx", "server/bot/index.ts"]],
];

const children = [];
let stopping = false;

function stop(exitCode, signal = "SIGTERM") {
  if (stopping) return;
  stopping = true;
  process.exitCode = exitCode;
  for (const child of children) {
    if (child.exitCode === null && child.signalCode === null) child.kill(signal);
  }
}

for (const [name, args] of commands) {
  const child = spawn(process.execPath, args, { stdio: "inherit" });
  children.push(child);
  child.on("error", (error) => {
    console.error(`${name} failed to start:`, error);
    stop(1);
  });
  child.on("exit", (code, signal) => {
    if (!stopping) {
      console.error(`${name} stopped (${signal ?? code}). Stopping development processes.`);
      stop(code ?? 1);
    }
  });
}

process.on("SIGINT", () => stop(130, "SIGINT"));
process.on("SIGTERM", () => stop(143));
