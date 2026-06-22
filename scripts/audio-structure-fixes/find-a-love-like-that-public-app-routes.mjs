import fs from "node:fs";
import path from "node:path";

const ROOT = "app";
const NEEDLES = [
  "a-love-like-that-d3dfd13c-7421-4671-8261-0c735cb51f38-bookend-twinkle.mp3",
  "d3dfd13c-7421-4671-8261-0c735cb51f38",
  "A LOVE LIKE THAT",
  "A Love Like That",
];

const SKIP_DIRS = new Set(["node_modules", ".next", ".git", "_saved-ui"]);

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) walk(full, out);
    } else {
      out.push(full);
    }
  }
  return out;
}

const hits = [];

for (const file of walk(ROOT)) {
  let text;
  try {
    text = fs.readFileSync(file, "utf8");
  } catch {
    continue;
  }

  text.split(/\r?\n/).forEach((line, index) => {
    if (NEEDLES.some((needle) => line.includes(needle))) {
      hits.push({
        file,
        line: index + 1,
        text: line.trim(),
      });
    }
  });
}

console.log(JSON.stringify({
  status: "A_LOVE_LIKE_THAT_PUBLIC_APP_ROUTE_AUDIT",
  hit_count: hits.length,
  hits,
}, null, 2));

if (hits.length > 0) process.exitCode = 2;
