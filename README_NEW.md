# SAM-CLI — Gemini Agent

An elite AI software engineering agent running inside a terminal CLI. SAM (an AI-powered developer) breaks complex problems into sequential steps and helps you build anything from scratch.

## Features

- **AI-Powered Workflow**: START → THINK → TOOL → OBSERVE → OUTPUT loop
- **5 Built-in Tools**: Weather API, GitHub user lookup, command execution, file I/O
- **Security First**: Command sanitization, API key protection, audit logging
- **Modular Design**: Clean separation of concerns (tools, prompts, helpers)
- **Session Logging**: Automatic audit trail of all agent steps

## Setup

### Prerequisites
- Node.js 18+
- npm/yarn
- Google Gemini API key

### Installation

```bash
npm install
```

### Configuration

Create a `.env` file in the root directory:

```env
GEMINI_API_KEY=your_api_key_here
```

## Usage

```bash
npm start
```

Then describe what you want to build. SAM will guide you through discovery, design, task planning, and execution.

### Example Commands

- `what portfolio website should I build?`
- `create a todo app with react`
- `build a cli tool for...`
- Type `STOP` to end the session

## Project Structure

```
sam-cli/
├── index.js                 # Main entry point
├── lib/
│   ├── tools.js            # All executable tools
│   ├── audit.js            # Session logging
│   ├── prompts.js          # System prompt
│   └── helpers.js          # Utilities (colors, readline, etc)
├── package.json
├── README.md
└── .gitignore
```

## Session Logs

Each session creates a `session-<timestamp>.log` file containing:
- All agent steps
- Tool calls and results
- Security events
- Errors and exceptions

Example:
```json
{"ts":"2026-05-06T10:30:00Z","event":"AGENT_STEP","step":"TOOL","content":"Executing command..."}
{"ts":"2026-05-06T10:30:05Z","event":"EXEC","cmd":"mkdir my-project"}
{"ts":"2026-05-06T10:30:10Z","event":"BLOCKED","cmd":"cat .env","pattern":"/cat\\s+.*\\.env/"}
```

## Security Rules

SAM enforces three core security rules:

**S1** — Never write API keys into files; always use `.env` variables  
**S2** — Never run destructive commands (rm -rf /, curl | bash)  
**S3** — All external requests must use HTTPS; add try/catch to async functions

## Tools Available

| Tool | Purpose |
|------|---------|
| `getTheWeatherOfCity(city)` | Fetch live weather data |
| `getGithubDetailsAboutUser(username)` | Get public GitHub profile |
| `executeCommand(cmd)` | Run shell commands safely |
| `writeFile({filePath, content})` | Create or update files |
| `readFile(filePath)` | Read file contents |

## Development

### File Organization

- **tools.js**: All tool implementations + command sanitization
- **audit.js**: Session logging to file
- **prompts.js**: System prompt (kept separate for easy updates)
- **helpers.js**: Terminal UI, color output, JSON parsing
- **index.js**: Main loop (~120 LOC after refactor)

### Adding New Tools

1. Add function to `lib/tools.js`
2. Export it
3. Add to `toolMap`
4. Document in system prompt

```javascript
export async function myNewTool(input) {
  try {
    // implementation
  } catch (err) {
    return `ERROR: ${err.message}`;
  }
}
```

## Troubleshooting

### GEMINI_API_KEY missing
- Ensure `.env` file exists in project root
- Check API key is valid and not expired

### Commands timing out
- Default timeout is 30 seconds
- Modify in `lib/tools.js` if needed

### Failed to parse Gemini response
- Check API quota (rate limits)
- Wait 30s for quota reset (automatic retry)

## License

MIT
