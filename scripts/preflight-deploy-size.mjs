import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const VERCEL_IGNORE_PATH = path.join(ROOT, ".vercelignore");
const REQUIRED_IGNORES = ["ops/", "staging/", "backups/", "tmp/", "reports/"];
const MAX_SINGLE_FILE_BYTES = 100 * 1024 * 1024;
const MAX_TRACKED_DEPLOY_BYTES = 2 * 1024 * 1024 * 1024;

function stop(message) {
  console.error(`DEPLOY SIZE PREFLIGHT: FAIL — ${message}`);
  process.exit(1);
}

function formatBytes(bytes) {
  const units = ["B", "KiB", "MiB", "GiB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(unit === 0 ? 0 : 2)} ${units[unit]}`;
}

function normalizeIgnore(line) {
  return line.trim().replace(/^\//, "");
}

function isIgnored(relativePath, ignores) {
  const normalized = relativePath.replaceAll(path.sep, "/");
  return ignores.some((entry) => {
    const clean = entry.replace(/\/$/, "");
    return normalized === clean || normalized.startsWith(`${clean}/`);
  });
}

if (!fs.existsSync(path.join(ROOT, ".git"))) {
  stop("run this gate from the repository root");
}

if (!fs.existsSync(VERCEL_IGNORE_PATH)) {
  stop(".vercelignore is missing");
}

const ignoreEntries = fs
  .readFileSync(VERCEL_IGNORE_PATH, "utf8")
  .split(/\r?\n/)
  .map(normalizeIgnore)
  .filter((line) => line && !line.startsWith("#"));

for (const required of REQUIRED_IGNORES) {
  if (!ignoreEntries.includes(required)) {
    stop(`.vercelignore is missing required exclusion ${required}`);
  }
}

let trackedFiles;
try {
  trackedFiles = execFileSync("git", ["ls-files", "-z"], {
    cwd: ROOT,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  })
    .split("\0")
    .filter(Boolean);
} catch (error) {
  stop(`could not enumerate tracked files: ${error instanceof Error ? error.message : String(error)}`);
}

let includedBytes = 0;
let includedFiles = 0;
let ignoredFiles = 0;
const oversized = [];
const largest = [];

for (const relativePath of trackedFiles) {
  if (isIgnored(relativePath, ignoreEntries)) {
    ignoredFiles += 1;
    continue;
  }

  const absolutePath = path.join(ROOT, relativePath);
  if (!fs.existsSync(absolutePath)) {
    stop(`tracked file is missing from controlled worktree: ${relativePath}`);
  }

  const stat = fs.lstatSync(absolutePath);
  if (!stat.isFile()) continue;

  includedFiles += 1;
  includedBytes += stat.size;
  largest.push({ relativePath, size: stat.size });

  if (stat.size > MAX_SINGLE_FILE_BYTES) {
    oversized.push({ relativePath, size: stat.size });
  }
}

largest.sort((a, b) => b.size - a.size);

console.log("K-KUT DEPLOY SIZE PREFLIGHT");
console.log("===========================");
console.log("TRACKED FILES:", trackedFiles.length);
console.log("DEPLOY-INCLUDED FILES:", includedFiles);
console.log("VERCEL-IGNORED TRACKED FILES:", ignoredFiles);
console.log("DEPLOY-INCLUDED BYTES:", formatBytes(includedBytes));
console.log("SINGLE-FILE LIMIT:", formatBytes(MAX_SINGLE_FILE_BYTES));
console.log("CONTROLLED TOTAL LIMIT:", formatBytes(MAX_TRACKED_DEPLOY_BYTES));
console.log("");
console.log("LARGEST DEPLOY-INCLUDED FILES:");
for (const entry of largest.slice(0, 10)) {
  console.log(`  ${formatBytes(entry.size).padStart(10)}  ${entry.relativePath}`);
}

if (oversized.length > 0) {
  for (const entry of oversized) {
    console.error(`OVERSIZED: ${formatBytes(entry.size)} ${entry.relativePath}`);
  }
  stop(`${oversized.length} deploy-included file(s) exceed the controlled single-file limit`);
}

if (includedBytes > MAX_TRACKED_DEPLOY_BYTES) {
  stop(
    `deploy-included tracked content is ${formatBytes(includedBytes)}, above the controlled ${formatBytes(MAX_TRACKED_DEPLOY_BYTES)} limit`,
  );
}

console.log("");
console.log("REQUIRED LARGE-LOCAL-DIRECTORY EXCLUSIONS: PASS");
console.log("OVERSIZED DEPLOY FILES: 0");
console.log("DEPLOY SIZE PREFLIGHT: PASS");
