import fs from "node:fs";
import { execFileSync } from "node:child_process";

function sh(args) {
  try {
    return execFileSync("git", args, { encoding: "utf8", maxBuffer: 1024 * 1024 * 80 });
  } catch {
    return "";
  }
}

const status = sh(["status", "--porcelain"])
  .split("\n")
  .filter(Boolean);

const untracked = status
  .filter((line) => line.startsWith("?? "))
  .map((line) => line.slice(3));

const modified = status
  .filter((line) => line.startsWith(" M ") || line.startsWith("M "))
  .map((line) => line.slice(3));

function bucket(file) {
  const lower = file.toLowerCase();

  if (
    /\.bak|\.backup|\.before-|before_|before-control|before-holiday|bak-a2p|copy| 2\.html/.test(lower) ||
    lower.includes(".bak-") ||
    lower.includes(".before-")
  ) {
    return ["ARCHIVE_OR_DELETE_BACKUP", "backup/copy file; likely not product"];
  }

  if (
    lower.startsWith("imports/") ||
    lower.startsWith("review-sessions/") ||
    lower.includes("/review/") ||
    lower.includes("review-queue") ||
    lower.includes("human-review") ||
    lower.includes("tpr") ||
    lower.includes("proof") ||
    lower.includes("scratch")
  ) {
    return ["ARCHIVE_OUTSIDE_REPO", "review/import/proof workflow storage"];
  }

  if (
    lower.startsWith("data/kk-sets/") ||
    lower.startsWith("data/kkr/") ||
    lower.startsWith("docs/") ||
    lower.startsWith("records/") ||
    lower.startsWith("tools/") ||
    lower.startsWith("scripts/") ||
    lower.startsWith("app/admin/") ||
    lower.startsWith("lib/kkr/")
  ) {
    return ["REVIEW_KEEP_OR_COMMIT", "possible system/doctrine/admin/review feature"];
  }

  if (
    lower.endsWith(".py") ||
    lower.endsWith(".mjs") ||
    lower.endsWith(".json") ||
    lower.endsWith(".md")
  ) {
    return ["REVIEW_KEEP_OR_COMMIT", "possible tool/data/doc"];
  }

  return ["REVIEW_MANUAL", "unclear"];
}

const buckets = {};
for (const file of untracked) {
  const [name, reason] = bucket(file);
  buckets[name] ||= [];
  buckets[name].push({ file, reason });
}

let md = `# Untracked Repo Clutter Triage\n\nGenerated: ${new Date().toISOString()}\n\n`;
md += `## Modified tracked files (${modified.length})\n\n`;
for (const f of modified) md += `- \`${f}\`\n`;
md += "\n";

for (const name of Object.keys(buckets).sort()) {
  md += `## ${name} (${buckets[name].length})\n\n`;
  for (const item of buckets[name]) md += `- \`${item.file}\` — ${item.reason}\n`;
  md += "\n";
}

fs.writeFileSync("records/recovery/untracked-repo-clutter-triage.md", md);

function write(name, rows) {
  fs.writeFileSync(
    `records/recovery/${name}`,
    (rows || []).map((x) => x.file).join("\n") + "\n"
  );
}

write("archive-or-delete-backups.txt", buckets.ARCHIVE_OR_DELETE_BACKUP);
write("archive-outside-repo.txt", buckets.ARCHIVE_OUTSIDE_REPO);
write("review-keep-or-commit.txt", buckets.REVIEW_KEEP_OR_COMMIT);
write("review-manual-untracked.txt", buckets.REVIEW_MANUAL);

console.log("UNTRACKED TRIAGE COMPLETE");
console.log("Modified tracked files:", modified.length);
for (const name of Object.keys(buckets).sort()) {
  console.log(`${name}: ${buckets[name].length}`);
}
console.log("");
console.log("Report:");
console.log("records/recovery/untracked-repo-clutter-triage.md");
