/**
 * Post-install script: downloads jira-cli binary from GitHub releases.
 * https://github.com/ankitpokhrel/jira-cli
 */
const fs = require("fs");
const path = require("path");
const https = require("https");

const REPO = "ankitpokhrel/jira-cli";
const JIRA_CLI_VERSION = "1.7.0";
const BIN_DIR = path.join(require("os").homedir(), ".pi-jira", "bin");
const VERSION_FILE = path.join(BIN_DIR, ".version");

function getPlatformArch() {
  const platform = process.platform; // win32, linux, darwin
  const arch = process.arch; // x64, arm64

  let os, cpu, ext, archiveExt;

  if (platform === "win32") {
    os = "Windows";
    ext = ".exe";
    archiveExt = ".zip";
  } else if (platform === "darwin") {
    os = "macOS";
    ext = "";
    archiveExt = ".tar.gz";
  } else {
    os = "Linux";
    ext = "";
    archiveExt = ".tar.gz";
  }

  if (arch === "x64") {
    cpu = "x86_64";
  } else if (arch === "arm64") {
    cpu = "arm64";
  } else {
    cpu = arch;
  }

  return { os, cpu, ext, archiveExt };
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const follow = (url) => {
      https.get(url, { headers: { "User-Agent": "jira-tool-installer" } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          follow(res.headers.location);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`Download failed: ${res.statusCode} from ${url}`));
          return;
        }
        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on("finish", () => { file.close(); resolve(); });
      }).on("error", reject);
    };
    follow(url);
  });
}

function extractZip(zipPath, destDir) {
  const { execSync } = require("child_process");
  // Windows: use PowerShell to extract
  execSync(
    `powershell -Command "Expand-Archive -Force -Path '${zipPath}' -DestinationPath '${destDir}'"`,
    { stdio: "inherit" }
  );
}

function extractTarGz(tarPath, destDir) {
  const { execSync } = require("child_process");
  execSync(`tar -xzf "${tarPath}" -C "${destDir}"`, { stdio: "inherit" });
}

async function main() {
  const { os, cpu, ext, archiveExt } = getPlatformArch();

  // jira-cli release asset naming: jira_<version>_<OS>_<arch>.tar.gz / .zip
  const assetName = `jira_${JIRA_CLI_VERSION}_${os}_${cpu}${archiveExt}`;
  const url = `https://github.com/${REPO}/releases/download/v${JIRA_CLI_VERSION}/${assetName}`;

  fs.mkdirSync(BIN_DIR, { recursive: true });

  const archivePath = path.join(BIN_DIR, assetName);
  const binaryDest = path.join(BIN_DIR, `jira${ext}`);

  // Check if already installed with correct version
  if (fs.existsSync(VERSION_FILE)) {
    const installed = fs.readFileSync(VERSION_FILE, "utf8").trim();
    if (installed === JIRA_CLI_VERSION && fs.existsSync(binaryDest)) {
      console.log(`jira-cli v${JIRA_CLI_VERSION} already installed at ${binaryDest}`);
      return;
    }
  }

  console.log(`Downloading jira-cli v${JIRA_CLI_VERSION} for ${os}/${cpu}...`);
  console.log(`  URL: ${url}`);

  try {
    await download(url, archivePath);
  } catch (e) {
    console.error(`Download failed: ${e.message}`);
    console.error(`\nManual install: download from https://github.com/${REPO}/releases`);
    console.error(`Place the 'jira' binary in: ${BIN_DIR}`);
    process.exit(1);
  }

  console.log("Extracting...");
  const tempDir = path.join(BIN_DIR, "_extract");
  fs.mkdirSync(tempDir, { recursive: true });

  try {
    if (archiveExt === ".zip") {
      extractZip(archivePath, tempDir);
    } else {
      extractTarGz(archivePath, tempDir);
    }

    // Find the jira binary in extracted files
    const extracted = findBinary(tempDir, `jira${ext}`);
    if (!extracted) {
      throw new Error(`Could not find jira${ext} in extracted archive`);
    }

    fs.copyFileSync(extracted, binaryDest);
    if (process.platform !== "win32") {
      fs.chmodSync(binaryDest, 0o755);
    }

    fs.writeFileSync(VERSION_FILE, JIRA_CLI_VERSION);
    console.log(`Installed jira-cli to ${binaryDest}`);
  } finally {
    // Cleanup
    fs.rmSync(tempDir, { recursive: true, force: true });
    fs.rmSync(archivePath, { force: true });
  }
}

function findBinary(dir, name) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const found = findBinary(full, name);
      if (found) return found;
    } else if (entry.name === name) {
      return full;
    }
  }
  return null;
}

main();
