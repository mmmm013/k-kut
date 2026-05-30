import fs from "node:fs";
import path from "node:path";

const publicRoot = "public";
const forbidden = [
  /controlled-review/i,
  /review-pack/i,
  /proof-pack/i,
  /\/_review\//i,
  /\/_proof\//i
];

let failed = false;

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    const st = fs.statSync(full);
    if (st.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

console.log("PUBLIC REVIEW/PROOF LEAK AUDIT");

for (const file of walk(publicRoot)) {
  const normalized = file.replaceAll(path.sep, "/");
  if (forbidden.some((rx) => rx.test(normalized))) {
    console.error("FAIL:", normalized);
    failed = true;
  }
}

if (failed) {
  console.error("PUBLIC REVIEW/PROOF LEAK AUDIT: FAIL");
  process.exit(1);
}

console.log("PUBLIC REVIEW/PROOF LEAK AUDIT: PASS");
