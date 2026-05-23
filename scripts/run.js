/**
 * Wrapper to run jira-cli with JIRA_API_TOKEN loaded from ~/.pi-jira/.token
 * Usage: node run.js <jira args...>
 *
 * This keeps the token isolated to the extension — no global env vars needed.
 */
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const PI_JIRA_DIR = path.join(require("os").homedir(), ".pi-jira");
const TOKEN_FILE = path.join(PI_JIRA_DIR, ".token");
const BIN_DIR = path.join(PI_JIRA_DIR, "bin");
const JIRA_BIN = path.join(BIN_DIR, process.platform === "win32" ? "jira.exe" : "jira");

// Load token
if (!fs.existsSync(TOKEN_FILE)) {
  console.error("❌ Token not found. Run setup first:");
  console.error("   node " + path.join(__dirname, "setup.js"));
  process.exit(1);
}

const token = fs.readFileSync(TOKEN_FILE, "utf8").trim();

if (!token) {
  console.error("❌ Token file is empty. Run setup again:");
  console.error("   node " + path.join(__dirname, "setup.js"));
  process.exit(1);
}

// Pass all arguments to jira binary
const args = process.argv.slice(2);

const child = spawn(JIRA_BIN, args, {
  stdio: "inherit",
  env: { ...process.env, JIRA_API_TOKEN: token },
});

child.on("exit", (code) => {
  process.exit(code || 0);
});

child.on("error", (err) => {
  console.error(`Failed to run jira: ${err.message}`);
  process.exit(1);
});
