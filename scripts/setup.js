/**
 * Interactive setup for pi-jira.
 * Prompts for Jira URL, email, API token.
 * Stores token in ~/.pi-jira/.token (isolated, not global env).
 * Then runs `jira init` with token injected via JIRA_API_TOKEN env var.
 */
const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { execSync } = require("child_process");

const PI_JIRA_DIR = path.join(require("os").homedir(), ".pi-jira");
const TOKEN_FILE = path.join(PI_JIRA_DIR, ".token");
const BIN_DIR = path.join(PI_JIRA_DIR, "bin");
const JIRA_BIN = path.join(BIN_DIR, process.platform === "win32" ? "jira.exe" : "jira");

function ask(rl, question, options = {}) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("\n🔧 pi-jira setup\n");

  if (!fs.existsSync(JIRA_BIN)) {
    console.error(`❌ jira binary not found at ${JIRA_BIN}`);
    console.error("   Run: pi install git:github.com/Complead/pi-jira");
    rl.close();
    process.exit(1);
  }

  // Check if token already exists
  if (fs.existsSync(TOKEN_FILE)) {
    const overwrite = await ask(rl, "⚠️  Token already configured. Overwrite? (y/N): ");
    if (overwrite.toLowerCase() !== "y") {
      console.log("Keeping existing token.");
      rl.close();
      return;
    }
  }

  console.log("Get your API token at: https://id.atlassian.com/manage-profile/security/api-tokens\n");

  const token = await ask(rl, "API Token: ");

  if (!token) {
    console.error("❌ Token cannot be empty.");
    rl.close();
    process.exit(1);
  }

  // Save token
  fs.mkdirSync(PI_JIRA_DIR, { recursive: true });
  fs.writeFileSync(TOKEN_FILE, token, { mode: 0o600 });
  console.log(`✅ Token saved to ${TOKEN_FILE}\n`);

  // Run jira init with token in env
  console.log("Now running 'jira init'...\n");
  try {
    execSync(`"${JIRA_BIN}" init`, {
      stdio: "inherit",
      env: { ...process.env, JIRA_API_TOKEN: token },
    });
    console.log("\n✅ Setup complete!");
  } catch (e) {
    console.error("\n⚠️  'jira init' exited with error, but token is saved.");
    console.error("    You can retry with: node scripts/setup.js");
  }

  rl.close();
}

main();
