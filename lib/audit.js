import { appendFileSync, mkdirSync } from "fs";
import { join } from "path";

// Ensure logs directory exists
const logsDir = "./logs";
mkdirSync(logsDir, { recursive: true });

const LOG_FILE = join(logsDir, `session-${Date.now()}.log`);

export function auditLog(event) {
  appendFileSync(
    LOG_FILE,
    JSON.stringify({ ts: new Date().toISOString(), ...event }) + "\n"
  );
}

export { LOG_FILE };
