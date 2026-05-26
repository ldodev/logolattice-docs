#!/usr/bin/env node
/**
 * Regenerate openapi.dev.json from openapi.json with a localhost server entry.
 * Run after editing openapi.json so dev and prod specs stay aligned.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const specPath = join(
  root,
  "api-reference/describe-api/openapi.json"
);
const devPath = join(
  root,
  "api-reference/describe-api/openapi.dev.json"
);

const spec = JSON.parse(readFileSync(specPath, "utf8"));
spec.servers = [
  {
    url: "http://localhost:3000",
    description: "Local development",
  },
  ...spec.servers.filter((s) => s.url !== "http://localhost:3000"),
];

writeFileSync(devPath, `${JSON.stringify(spec, null, 2)}\n`);
