/**
 * Non-interactive setup for pi-jira.
 * Accepts all parameters via CLI flags.
 * Stores token in ~/.pi-jira/.token (isolated, not global env).
 * Then runs `jira init` with flags and token injected via JIRA_API_TOKEN env var.
 *
 * Usage:
 *   node setup.js --token <token> --server <url> --login <email> --project <key> --board <name>
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const PI_JIRA_DIR = path.join(require("os").homedir(), ".pi-jira");
const TOKEN_FILE = path.join(PI_JIRA_DIR, ".token");
const BIN_DIR = path.join(PI_JIRA_DIR, "bin");
const JIRA_BIN = path.join(BIN_DIR, process.platform === "win32" ? "jira.exe" : "jira");

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    if (argv[i].startsWith("--") && i + 1 < argv.length) {
      const key = argv[i].slice(2);
      args[key] = argv[++i];
    }
  }
  return args;
}

function main() {
  const args = parseArgs(process.argv);

  console.log("\n🔧 pi-jira setup\n");

  if (!fs.existsSync(JIRA_BIN)) {
    console.error(`❌ jira binary not found at ${JIRA_BIN}`);
    console.error("   Run: pi install git:github.com/Complead/pi-jira");
    process.exit(1);
  }

  // Validate required params
  const required = ["token", "server", "login", "project"];
  const missing = required.filter((k) => !args[k]);
  if (missing.length > 0) {
    console.error(`❌ Missing required flags: ${missing.map((k) => "--" + k).join(", ")}`);
    console.error("\nUsage:");
    console.error('  node setup.js --token <token> --server <url> --login <email> --project <key> [--board <name>]');
    process.exit(1);
  }

  // Save token
  fs.mkdirSync(PI_JIRA_DIR, { recursive: true });
  fs.writeFileSync(TOKEN_FILE, args.token, { mode: 0o600 });
  console.log(`✅ Token saved to ${TOKEN_FILE}\n`);

  // Build jira init command
  let cmd = `"${JIRA_BIN}" init --installation cloud --force`;
  cmd += ` --server "${args.server}"`;
  cmd += ` --login "${args.login}"`;
  cmd += ` --project "${args.project}"`;
  if (args.board) {
    cmd += ` --board "${args.board}"`;
  }

  console.log("Running 'jira init'...\n");
  try {
    execSync(cmd, {
      stdio: "inherit",
      env: { ...process.env, JIRA_API_TOKEN: args.token },
    });
    console.log("\n✅ Setup complete!");
  } catch (e) {
    console.error("\n⚠️  'jira init' exited with error, but token is saved.");
    console.error("    Check your parameters and retry.");
    process.exit(1);
  }
}

main();
