import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";

import { auditLog } from "./lib/audit.js";
import { toolMap } from "./lib/tools.js";
import { SYSTEM_PROMPT } from "./lib/prompts.js";
import {
  ask,
  parseJSON,
  colorize,
  colors,
  showBanner,
  closeReadline,
  boxMessage,
  stepHeader,
  outputBox,
  inputPrompt,
  samMessage,
  userMessage,
  interactivePrompt,
  actionMenu,
  workflowStatus,
} from "./lib/helpers.js";
import { startSpinner, stopSpinner } from "./lib/spinner.js";

// ─── Env Guard ───────────────────────────────────────────────────────────────
if (!process.env.GEMINI_API_KEY) {
  boxMessage("GEMINI_API_KEY missing from .env", "error");
  process.exit(1);
}


// ─── Gemini Setup ────────────────────────────────────────────────────────────
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// ─── Main Loop ───────────────────────────────────────────────────────────────
async function main() {
  showBanner();
  samMessage("Hi! I'm SAM, your AI development assistant. I can help you build websites, clone projects, and automate workflows.\n\nWhat would you like to create today?");

  const chat = model.startChat({
    history: [
      { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
      {
        role: "model",
        parts: [
          {
            text: '{"step":"START","content":"SAM initialized. Ready to receive instructions."}',
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json",
    },
  });

  const userInput = await ask(inputPrompt("What do you want to build?"));
  userMessage(userInput);

  let nextUserMessage = userInput;

  while (true) {
    try {
      startSpinner();

      const result = await chat.sendMessage(nextUserMessage);
      const raw = result.response.text();

      stopSpinner();

      let parsed;
      try {
        parsed = parseJSON(raw);
      } catch (e) {
        stopSpinner("Parse error");
        console.log(colors.GRAY + "Debug: " + raw.substring(0, 150) + colors.RESET);
        boxMessage("Response parsing failed. Retrying...", "error");
        nextUserMessage =
          "Your response was not valid JSON. Please respond with ONLY a single valid JSON object. No markdown, no extra text. Format: {\"step\":\"THINK\",\"content\":\"your message\"}";
        continue;
      }

      const { step, content, tool_name, tool_args } = parsed;
      auditLog({
        event: "AGENT_STEP",
        step,
        content: content?.slice(0, 100),
      });

      if (step === "START") {
        samMessage(content);
        nextUserMessage = "Understood. Continue.";
      } else if (step === "THINK") {
        const preview = content.slice(0, 90) + (content.length > 90 ? "..." : "");
        console.log(colors.YELLOW + "💭 " + colors.BOLD + "Thinking..." + colors.RESET + "\n" + colors.GRAY + preview + colors.RESET + "\n");
        nextUserMessage = "Continue thinking or take action.";
      } else if (step === "TOOL") {
        const toolDisplay = tool_name.replace(/([A-Z])/g, " $1").trim();
        console.log(colors.MAGENTA + "🔧 " + colors.BOLD + "Executing: " + toolDisplay + colors.RESET);

        const fn = toolMap[tool_name];
        let observeResult;

        if (!fn) {
          observeResult = `ERROR: Tool "${tool_name}" does not exist.`;
        } else {
          try {
            const data = await fn(tool_args);
            observeResult =
              typeof data === "object" ? JSON.stringify(data, null, 2) : String(data);
          } catch (err) {
            observeResult = `ERROR: ${err.message}`;
          }
        }

        const resultPreview = typeof observeResult === "string" && observeResult.length > 80 
          ? observeResult.slice(0, 80) + "..." 
          : observeResult;
        console.log(colors.BLUE + "✓ " + resultPreview + colors.RESET + "\n");

        nextUserMessage = JSON.stringify({
          step: "OBSERVE",
          content: observeResult,
        });
      } else if (step === "OUTPUT") {
        samMessage(content);

        const userReply = await ask(inputPrompt("Your response (or type STOP to exit)"));

        if (userReply.trim().toUpperCase() === "STOP") {
          console.log();
          samMessage("Thank you for using SAM! Goodbye! 👋");
          closeReadline();
          break;
        }

        userMessage(userReply);
        nextUserMessage = userReply;
      } else {
        boxMessage("Unknown step: " + step, "warning");
        nextUserMessage =
          "Invalid step. Respond with a valid JSON object with step being one of: START, THINK, TOOL, OBSERVE, OUTPUT.";
      }
    } catch (err) {
      boxMessage("Error: " + err.message, "error");
      if (err.message.includes("429")) {
        console.log("  ⏳ Waiting 30 seconds for quota reset...\n");
        await new Promise((r) => setTimeout(r, 30000));
      } else {
        nextUserMessage = "An error occurred. Please try again.";
      }
    }
  }
}

main().catch((err) => {
  boxMessage("Fatal error: " + err.message, "error");
  process.exit(1);
});

