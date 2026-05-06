const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
let currentFrame = 0;
let interval = null;

export function startSpinner(message = "SAM is thinking") {
  currentFrame = 0;
  interval = setInterval(() => {
    process.stdout.write(
      `\r\x1b[36m${frames[currentFrame]} ${message}\x1b[0m`
    );
    currentFrame = (currentFrame + 1) % frames.length;
  }, 80);
}

export function stopSpinner(finalMessage = "") {
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
  if (finalMessage) {
    process.stdout.write(`\r\x1b[32m✓ ${finalMessage}\x1b[0m\n`);
  } else {
    process.stdout.write(`\r\x1b[32m ✓ \x1b[0m\n`);
  }
}

export function updateSpinner(message = "Processing") {
  if (interval) {
    // Just for reference if you want to update message mid-spin
  }
}
