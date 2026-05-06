import axios from "axios";
import { exec } from "child_process";
import { 
  mkdirSync, 
  writeFileSync, 
  existsSync, 
  readFileSync 
} from "fs";
import * as path from "path";
import { platform } from "os";
import { auditLog } from "./audit.js";
import { addWatermark } from "./watermark.js";
import {
  scrapeQuotes,
  scrapeBooks,
  generatePortfolioSite,
  generateQuoteGallery,
} from "./scrape-generate.js";

// Security patterns to block dangerous commands
const BLOCKED_PATTERNS = [
  /rm\s+-rf\s+\/(?!\w)/,       // rm -rf /
  /curl.*\|\s*(bash|sh)/,      // curl-pipe-bash
  /wget.*\|\s*(bash|sh)/,      // wget-pipe-bash
  /cat\s+.*\.env/,             // reading secrets
  /printenv|env\s*$/,          // dumping env vars
  /:\(\)\{.*\};:/,             // fork bomb
];

function sanitizeCommand(cmd = "") {
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(cmd)) {
      auditLog({ event: "BLOCKED", cmd, pattern: pattern.toString() });
      throw new Error(`Command blocked by security policy: ${pattern}`);
    }
  }
  return cmd;
}

// ─── Tools ───────────────────────────────────────────────────────────────────

export async function getTheWeatherOfCity(cityname = "") {
  try {
    const url = `https://wttr.in/${cityname.toLowerCase()}?format=%C+%t`;
    const { data } = await axios.get(url, { responseType: "text" });
    return `The Weather of ${cityname} is ${data}`;
  } catch (err) {
    return `Error fetching weather: ${err.message}`;
  }
}

export async function getGithubDetailsAboutUser(username = "") {
  try {
    const url = `https://api.github.com/users/${username}`;
    const { data } = await axios.get(url);
    return {
      login: data.login,
      name: data.name,
      blog: data.blog,
      public_repos: data.public_repos,
    };
  } catch (err) {
    return `Error fetching GitHub info: ${err.message}`;
  }
}

export async function executeCommand(input) {
  let safeCmd;
  try {
    const cmd = typeof input === "string" ? input : input?.cmd || "";
    safeCmd = sanitizeCommand(cmd);
  } catch (err) {
    return `BLOCKED: ${err.message}`;
  }

  auditLog({ event: "EXEC", cmd: safeCmd });

  // Detect OS and use appropriate shell
  const isWindows = platform() === "win32";
  const shell = isWindows ? "cmd.exe" : "/bin/bash";

  return new Promise((res) => {
    exec(
      safeCmd,
      { shell, timeout: 30000, maxBuffer: 1024 * 512 },
      (error, stdout, stderr) => {
        if (error) {
          const msg = `ERROR: ${stderr || error.message}`;
          auditLog({ event: "EXEC_ERROR", cmd: safeCmd, error: msg });
          res(msg);
        } else {
          res(stdout || "Command executed successfully.");
        }
      }
    );
  });
}

export async function writeFile(input) {
  let filePath, content;

  if (typeof input === "object" && input !== null) {
    filePath = input.filePath;
    content = input.content;
  } else {
    return "ERROR: writeFile requires {filePath, content} object";
  }

  if (!filePath || !content) {
    return "ERROR: filePath and content are required";
  }

  try {
    // Add watermark for web files
    const ext = filePath.split(".").pop().toLowerCase();
    if (["html", "css", "js"].includes(ext)) {
      content = addWatermark(filePath, content);
    }

    mkdirSync(path.dirname(filePath), { recursive: true });
    writeFileSync(filePath, content);
    return `Successfully wrote to ${filePath}`;
  } catch (err) {
    return `ERROR: ${err.message}`;
  }
}

export async function readFile(input) {
  let filePath;

  if (typeof input === "object" && input !== null) {
    filePath = input.filePath;
  } else if (typeof input === "string") {
    filePath = input;
  } else {
    return "ERROR: readFile requires filePath";
  }

  try {
    if (!existsSync(filePath)) {
      return `File ${filePath} does not exist.`;
    }
    return readFileSync(filePath, "utf-8");
  } catch (err) {
    return `ERROR: ${err.message}`;
  }
}

export const toolMap = {
  getTheWeatherOfCity,
  getGithubDetailsAboutUser,
  executeCommand,
  writeFile,
  readFile,
  scrapeQuotes,
  scrapeBooks,
  generatePortfolioSite,
  generateQuoteGallery,
};
