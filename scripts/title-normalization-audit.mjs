import fs from "fs";
import path from "path";

const { normalizeTrackTitle } = await import("../app/lib/normalize-title.ts");

const roots = [
  "app",
  "promos",
  "content",
  "reports",
];

const badPatterns = [
  /^\s*\d{1,4}\s*[-–—]\s*/i,
  /^\s*KLEIGH\s*[-–—]\s*/i,
  /^\s*KLE\$IGH\s*[-–—]\s*/i,
  /^\s*Music Maykers\s*[-–—]\s*/i,
  /^\s*Lloyd G Miller\s*[-–—]\s*/i,
  /^\s*Elle Christine\s*[-–—]\s*/i,
];

const samples = [
  "003 - Lloyd G Miller - A LOVE LIKE THAT.mp3",
  "039 - Elle Christine - BELIEVE IN LOVE.mp3",
  "KLEIGH - AWAKE .wav",
  "032 - Music Maykers - BE MINE TONIGHT - INSTRO.mp3",
  "147 - KLEIGH - FOREVER IT'S GOODBYE (for Victims of Abuse!).mp3",
  "Down Baby - INSTRO.mp3",
  "Thank You.mp3",
];

console.log("TITLE NORMALIZATION SAMPLE CHECK");
for (const s of samples) {
  console.log(`${s} => ${normalizeTrackTitle(s)}`);
}

console.log("\nPUBLIC FILE STRING AUDIT");
let findings = [];

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (["node_modules", ".next", ".vercel", ".git"].includes(item)) continue;
      walk(full);
    } else if (/\.(ts|tsx|js|jsx|json|md|txt)$/i.test(full)) {
      const text = fs.readFileSync(full, "utf8");
      const lines = text.split(/\r?\n/);
      lines.forEach((line, idx) => {
        for (const pat of badPatterns) {
          if (pat.test(line.trim().replace(/^["'`]/, ""))) {
            findings.push({
              file: full,
              line: idx + 1,
              text: line.trim().slice(0, 220),
            });
          }
        }
      });
    }
  }
}

for (const root of roots) walk(root);

if (!fs.existsSync("reports")) fs.mkdirSync("reports");
fs.writeFileSync(
  "reports/title-normalization-audit.json",
  JSON.stringify({ findings }, null, 2)
);

if (findings.length) {
  console.log(`\nFOUND ${findings.length} POSSIBLE TITLE VIOLATIONS`);
  for (const f of findings.slice(0, 80)) {
    console.log(`${f.file}:${f.line}: ${f.text}`);
  }
} else {
  console.log("\nNo obvious title-prefix violations found in scanned public files.");
}

console.log("\nSaved reports/title-normalization-audit.json");
