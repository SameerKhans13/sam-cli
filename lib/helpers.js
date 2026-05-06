import * as readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

export const ask = (q) => new Promise((res) => rl.question(q, res));

export function parseJSON(raw) {
  if (!raw || typeof raw !== 'string') {
    throw new Error('Invalid response: not a string');
  }

  // Strip markdown code fences
  let cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  // Remove any leading/trailing whitespace
  cleaned = cleaned.replace(/^\uFEFF/, '').trim();

  // Try to find JSON object if wrapped in text
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch && !cleaned.startsWith('{')) {
    cleaned = jsonMatch[0];
  }

  if (!cleaned) {
    throw new Error('No JSON found in response');
  }

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    // Try to fix common issues like trailing commas
    cleaned = cleaned.replace(/,\s*([}\]])/g, '$1');
    try {
      return JSON.parse(cleaned);
    } catch (e2) {
      throw new Error(`Failed to parse JSON: ${e2.message}\nResponse: ${cleaned.substring(0, 200)}`);
    }
  }
}

// ── Color Codes ───────────────────────────────────────────────────────────────
export const colors = {
  RESET: "\x1b[0m",
  BOLD: "\x1b[1m",
  DIM: "\x1b[2m",
  CYAN: "\x1b[36m",
  YELLOW: "\x1b[33m",
  MAGENTA: "\x1b[35m",
  BLUE: "\x1b[34m",
  GREEN: "\x1b[32m",
  RED: "\x1b[31m",
  WHITE: "\x1b[37m",
  GRAY: "\x1b[90m",
};

export function colorize(step, text) {
  const stepColors = {
    START: colors.CYAN,
    THINK: colors.YELLOW,
    TOOL: colors.MAGENTA,
    OBSERVE: colors.BLUE,
    OUTPUT: colors.GREEN,
  };
  return `${stepColors[step] || ""}${colors.BOLD}${text}${colors.RESET}`;
}

export function showBanner() {
  console.log();
  console.log(colors.CYAN + "╔" + "═".repeat(62) + "╗" + colors.RESET);
  console.log(colors.CYAN + "║" + colors.RESET);
  console.log(colors.CYAN + "║" + colors.RESET + colors.BOLD + colors.WHITE + "  🤖 SAM-CLI — Your Personal AI Development Agent".padEnd(63) + colors.RESET + colors.CYAN + "║" + colors.RESET);
  console.log(colors.CYAN + "║" + colors.RESET + colors.BOLD + colors.CYAN + "  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━".padEnd(63) + colors.RESET + colors.CYAN + "║" + colors.RESET);
  console.log(colors.CYAN + "║" + colors.RESET);
  console.log(colors.CYAN + "║" + colors.RESET + colors.GRAY + "  Build websites, clone projects, automate workflows".padEnd(63) + colors.RESET + colors.CYAN + "║" + colors.RESET);
  console.log(colors.CYAN + "║" + colors.RESET + colors.GRAY + "  Powered by Google Gemini 2.5-Flash".padEnd(63) + colors.RESET + colors.CYAN + "║" + colors.RESET);
  console.log(colors.CYAN + "║" + colors.RESET);
  console.log(colors.CYAN + "╚" + "═".repeat(62) + "╝" + colors.RESET);
  console.log();
}

// Chat-like message from SAM
export function samMessage(text) {
  const width = 60;
  const lines = text.split("\n");
  console.log();
  console.log(colors.CYAN + "┌─ 🤖 SAM ".padEnd(width + 4, "─") + "┐" + colors.RESET);
  
  lines.forEach((line) => {
    const wrapped = wrapText(line, width);
    wrapped.forEach((wrappedLine) => {
      console.log(colors.CYAN + "│ " + colors.RESET + colors.WHITE + wrappedLine.padEnd(width + 2) + colors.CYAN + "│" + colors.RESET);
    });
  });
  
  console.log(colors.CYAN + "└" + "─".repeat(width + 2) + "┘" + colors.RESET);
  console.log();
}

// Chat-like message from User
export function userMessage(text) {
  const width = 60;
  const lines = text.split("\n");
  console.log();
  console.log(colors.MAGENTA + "┌─ 👤 You ".padEnd(width + 4, "─") + "┐" + colors.RESET);
  
  lines.forEach((line) => {
    const wrapped = wrapText(line, width);
    wrapped.forEach((wrappedLine) => {
      console.log(colors.MAGENTA + "│ " + colors.RESET + colors.YELLOW + wrappedLine.padEnd(width + 2) + colors.MAGENTA + "│" + colors.RESET);
    });
  });
  
  console.log(colors.MAGENTA + "└" + "─".repeat(width + 2) + "┘" + colors.RESET);
  console.log();
}

// Helper function to wrap text
function wrapText(text, width) {
  const words = text.split(" ");
  const lines = [];
  let currentLine = "";
  
  words.forEach((word) => {
    if ((currentLine + word).length > width) {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine += (currentLine ? " " : "") + word;
    }
  });
  
  if (currentLine) lines.push(currentLine);
  return lines.length > 0 ? lines : [""];
}

export function section(title) {
  console.log(colors.BOLD + colors.BLUE + "┌─ " + title + " " + "─".repeat(Math.max(0, 45 - title.length)) + colors.RESET);
}

export function endSection() {
  console.log(colors.BOLD + colors.BLUE + "└" + "─".repeat(47) + colors.RESET);
  console.log();
}

export function boxMessage(message, type = "info") {
  const typeConfig = {
    info: { icon: "💡", color: colors.BLUE, title: "INFO" },
    success: { icon: "🎉", color: colors.GREEN, title: "SUCCESS" },
    error: { icon: "⚠️", color: colors.RED, title: "ERROR" },
    warning: { icon: "⚡", color: colors.YELLOW, title: "WARNING" },
  };
  const config = typeConfig[type] || typeConfig.info;
  const lines = message.split("\n");
  const width = 62;
  
  console.log();
  console.log(config.color + "┌─ " + config.icon + " " + config.title + " ".padEnd(width - config.title.length - 7, "─") + "┐" + colors.RESET);
  
  lines.forEach((line) => {
    const wrapped = wrapText(line, width - 4);
    wrapped.forEach((wrappedLine) => {
      const padded = wrappedLine.padEnd(width - 2);
      console.log(config.color + "│ " + colors.RESET + padded + config.color + " │" + colors.RESET);
    });
  });
  
  console.log(config.color + "└" + "─".repeat(width) + "┘" + colors.RESET);
  console.log();
}

export function interactivePrompt(question, options = null) {
  console.log();
  if (options && options.length > 0) {
    console.log(colors.CYAN + "┌─ 📋 OPTIONS ".padEnd(50, "─") + "┐" + colors.RESET);
    options.forEach((opt, idx) => {
      const num = idx + 1;
      console.log(colors.CYAN + "│ " + colors.RESET + colors.WHITE + `${num}. ${opt}`.padEnd(48) + colors.CYAN + " │" + colors.RESET);
    });
    console.log(colors.CYAN + "└" + "─".repeat(50) + "┘" + colors.RESET);
    console.log();
  }
  
  const prompt = colors.BOLD + colors.MAGENTA + "❯ " + colors.RESET + colors.WHITE + question + colors.RESET + " ";
  return prompt;
}

export function stepIndicator(step, status = "pending") {
  const indicators = {
    pending: { icon: "⭕", color: colors.GRAY },
    active: { icon: "🟡", color: colors.YELLOW },
    completed: { icon: "✅", color: colors.GREEN },
    error: { icon: "❌", color: colors.RED },
  };
  const indicator = indicators[status] || indicators.pending;
  return indicator.color + indicator.icon + colors.RESET + " " + step;
}

export function stepHeader(step, name) {
  const stepIcons = {
    START: "🚀",
    THINK: "🧠",
    TOOL: "🔧",
    OBSERVE: "👁",
    OUTPUT: "✅",
  };
  const stepColors = {
    START: colors.CYAN,
    THINK: colors.YELLOW,
    TOOL: colors.MAGENTA,
    OBSERVE: colors.BLUE,
    OUTPUT: colors.GREEN,
  };
  
  const icon = stepIcons[step] || "•";
  const color = stepColors[step] || colors.WHITE;
  const width = 50;
  
  console.log();
  console.log(color + colors.BOLD + "╔ " + icon + " " + step + colors.RESET + color + colors.BOLD + " " + "═".repeat(Math.max(0, width - step.length - 5)) + "╗" + colors.RESET);
  console.log(color + colors.BOLD + "║" + colors.RESET + " " + name.padEnd(width - 2) + color + colors.BOLD + "║" + colors.RESET);
  console.log(color + colors.BOLD + "╠" + "═".repeat(width) + "╣" + colors.RESET);
}

export function outputBox(content) {
  const width = 62;
  const lines = content.split("\n");
  
  console.log();
  console.log(colors.BOLD + colors.GREEN + "╔" + "═ OUTPUT ".padEnd(width + 2, "═") + "╗" + colors.RESET);
  
  lines.forEach((line) => {
    const trimmed = line.slice(0, width - 2).padEnd(width - 2);
    console.log(colors.GREEN + colors.BOLD + "║" + colors.RESET + " " + trimmed + colors.GREEN + colors.BOLD + " ║" + colors.RESET);
  });
  
  console.log(colors.BOLD + colors.GREEN + "╚" + "═".repeat(width + 2) + "╝" + colors.RESET);
  console.log();
}

export function inputPrompt(question) {
  return interactivePrompt(question);
}

export function displayTask(taskNumber, taskName, status = "pending") {
  const statusEmoji = status === "completed" ? "✅" : status === "in-progress" ? "⏳" : "⭕";
  console.log(colors.GRAY + `  ${statusEmoji} Task ${taskNumber}: ${taskName}` + colors.RESET);
}

export function sectionDivider(title = "") {
  const width = 62;
  if (title) {
    const padding = Math.max(0, width - title.length - 4);
    console.log(colors.GRAY + "─".repeat(2) + " " + title + " " + "─".repeat(padding) + colors.RESET);
  } else {
    console.log(colors.GRAY + "─".repeat(width) + colors.RESET);
  }
}

export function showProgress(current, total) {
  const percentage = Math.round((current / total) * 100);
  const filled = Math.round((percentage / 100) * 20);
  const empty = 20 - filled;
  const bar = "█".repeat(filled) + "░".repeat(empty);
  console.log(colors.CYAN + `  Progress: [${bar}] ${percentage}%` + colors.RESET);
}

// Status indicator for workflow steps
export function workflowStatus(steps) {
  console.log();
  console.log(colors.CYAN + "┌─ 📊 WORKFLOW STATUS ".padEnd(62, "─") + "┐" + colors.RESET);
  steps.forEach((step) => {
    const line = `  ${step}`.padEnd(60);
    console.log(colors.CYAN + "│ " + colors.RESET + line + colors.CYAN + " │" + colors.RESET);
  });
  console.log(colors.CYAN + "└" + "─".repeat(62) + "┘" + colors.RESET);
  console.log();
}

// Quick action menu
export function actionMenu(title, actions) {
  console.log();
  console.log(colors.MAGENTA + "┌─ ⚡ " + title + " ".padEnd(50 - title.length, "─") + "┐" + colors.RESET);
  actions.forEach((action, idx) => {
    const num = idx + 1;
    const line = `${num}. ${action}`.padEnd(58);
    console.log(colors.MAGENTA + "│ " + colors.RESET + line + colors.MAGENTA + " │" + colors.RESET);
  });
  console.log(colors.MAGENTA + "└" + "─".repeat(60) + "┘" + colors.RESET);
  console.log();
}

export function closeReadline() {
  rl.close();
}

export { rl };
