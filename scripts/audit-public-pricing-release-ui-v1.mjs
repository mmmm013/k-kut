
import fs from "node:fs";
import path from "node:path";

const roots = ["app", "components", "lib"];
const exts = new Set([".ts", ".tsx", ".js", ".jsx", ".json", ".md"]);
const skip = ["node_modules", ".next", ".git", "review-sessions", "records", "scripts", "processing", "doctrine"];
const failures = [];

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (skip.some(x => p.includes(`${path.sep}${x}${path.sep}`) || p.endsWith(`${path.sep}${x}`))) continue;
    if (ent.isDirectory()) walk(p, out);
    else if (exts.has(path.extname(p))) out.push(p);
  }
  return out;
}

function windows(text, regex, radius = 1000) {
  const result = [];
  for (const m of text.matchAll(regex)) {
    const i = m.index ?? 0;
    result.push(text.slice(Math.max(0, i - radius), Math.min(text.length, i + radius)));
  }
  return result;
}

for (const file of roots.flatMap(r => walk(r))) {
  const s = fs.readFileSync(file, "utf8");

  if (s.includes("Short-KUT")) failures.push(`${file}: forbidden public casing Short-KUT`);
  if (s.includes("SHORT-KUT")) failures.push(`${file}: forbidden public casing SHORT-KUT`);

  for (const w of windows(s, /\$4\.99|4\.99|Making a Statement|Here.?s My Dad|Here’s My Dad|Here's My Dad/gi, 1200)) {
    if (/short music moment/i.test(w)) failures.push(`${file}: $4.99 public card says “short music moment”`);
    if (/quick music moment/i.test(w)) failures.push(`${file}: $4.99 public card says “quick music moment”`);
  }

  for (const w of windows(s, /\$(1\.99|4\.99|9\.99|11\.99|14\.99)|(1\.99|4\.99|9\.99|11\.99|14\.99)/g, 1400)) {
    const hasAudio = /\.(mp3|wav|m4a)/i.test(w);
    const obviousNoTwinkleOrInternal = /internal-proof|_work|review|no-tail|tmp-|draft|coarse|proof/i.test(w);
    if (hasAudio && obviousNoTwinkleOrInternal) {
      failures.push(`${file}: paid public card references obvious internal/no-Twinkle audio`);
    }
  }
}

if (failures.length) {
  console.error("PUBLIC PRICING / RELEASE UI AUDIT: FAIL");
  for (const f of failures) console.error(" - " + f);
  process.exit(1);
}

console.log("PUBLIC PRICING / RELEASE UI AUDIT: PASS");
console.log("$4.99 cards cannot say short/quick music moment; paid public cards cannot expose obvious internal/no-Twinkle audio.");
