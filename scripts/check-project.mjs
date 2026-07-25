import { access, readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = fileURLToPath(new URL("../", import.meta.url));
const requiredFiles = [
  "manifest.json",
  "src/background.js",
  "src/core/page-audit.js",
  "src/core/report-builder.js",
  "src/popup/popup.html",
  "src/report/report.html",
  "README.md",
  "LICENSE"
];

for (const file of requiredFiles) {
  await access(join(root, file));
}

const manifest = JSON.parse(await readFile(join(root, "manifest.json"), "utf8"));
if (manifest.manifest_version !== 3) {
  throw new Error("SiteProof must remain a Manifest V3 extension.");
}

for (const permission of ["activeTab", "debugger", "storage", "tabs"]) {
  if (!manifest.permissions.includes(permission)) {
    throw new Error(`Missing required extension permission: ${permission}`);
  }
}

const jsFiles = [];
await collectJavaScript(join(root, "src"), jsFiles);
for (const file of jsFiles) {
  const result = spawnSync(process.execPath, ["--check", file], {
    encoding: "utf8"
  });
  if (result.status !== 0) {
    throw new Error(result.stderr || `Syntax check failed: ${file}`);
  }
}

console.log(`Project check passed: ${requiredFiles.length} required files, ${jsFiles.length} JS modules.`);

async function collectJavaScript(directory, output) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await collectJavaScript(path, output);
    else if (entry.name.endsWith(".js")) output.push(path);
  }
}
