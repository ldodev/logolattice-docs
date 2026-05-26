#!/usr/bin/env node
/**
 * Run `mint dev` with openapi.dev.json (includes http://localhost:3000).
 * Restores docs.json when the process exits.
 */
import { spawn } from "node:child_process";
import { copyFileSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const docsPath = join(root, "docs.json");
const backupPath = join(root, "docs.json.__mint_dev_backup__");
const devOpenapi = "api-reference/describe-api/openapi.dev.json";

await import("./sync-openapi-dev.mjs");

const docs = JSON.parse(readFileSync(docsPath, "utf8"));
copyFileSync(docsPath, backupPath);

docs.navigation.tabs[0].groups[0].openapi = devOpenapi;
docs.api ??= {};
docs.api.playground ??= {};
docs.api.playground.proxy = false;

writeFileSync(docsPath, `${JSON.stringify(docs, null, 2)}\n`);

let restored = false;
function restore() {
  if (restored) return;
  restored = true;
  copyFileSync(backupPath, docsPath);
}

process.on("SIGINT", () => {
  restore();
  process.exit(130);
});
process.on("SIGTERM", () => {
  restore();
  process.exit(143);
});

const mintArgs = process.argv.slice(2);
const child = spawn("mint", ["dev", ...mintArgs], {
  cwd: root,
  stdio: "inherit",
  shell: process.platform === "win32",
});

child.on("exit", (code, signal) => {
  restore();
  if (signal) {
    process.exit(1);
  }
  process.exit(code ?? 0);
});
