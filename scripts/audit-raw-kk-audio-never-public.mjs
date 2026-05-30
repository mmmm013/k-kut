import fs from "node:fs";

let failed = false;

function fail(msg) {
  console.error("FAIL:", msg);
  failed = true;
}

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const name of fs.readdirSync(dir)) {
    const full = `${dir}/${name}`;
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

function read(file) {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return "";
  }
}

console.log("RAW KK AUDIO NEVER PUBLIC AUDIT");

const doc = "docs/4pe-learning/RAW_KK_AUDIO_NEVER_PUBLIC_RULE.md";
const required = [
  "Raw KK audio is never public customer audio",
  "KKs and KK-Kombos may be searched, suggested, selected, compared, and assembled internally",
  "They become customer-facing only after materialization into finished II / DP audio",
  "AUDIO CAN NEVER LEAVE AN II",
  "Public buyer pages may only play finished II delivery audio",
  "MC-BOT must not expose raw KK audio",
  "KK-Kombos remain guided/custom through MC-BOT request behavior"
];

if (!fs.existsSync(doc)) {
  fail(`Missing doctrine file: ${doc}`);
} else {
  const text = read(doc);
  for (const term of required) {
    if (!text.includes(term)) fail(`Doctrine missing required term: ${term}`);
  }
}

const publicBuyerFiles = walk("app").filter((file) =>
  /\.(tsx|ts|jsx|js)$/i.test(file) &&
  (
    file.includes("app/personal") ||
    file.includes("app/holiday") ||
    file.includes("app/romance") ||
    file.includes("app/kupid") ||
    file.includes("app/wedding")
  )
);

for (const file of publicBuyerFiles) {
  const text = read(file);
  const lower = text.toLowerCase();

  if (lower.includes("supabase.co/storage")) {
    fail(`Public buyer file references Supabase source/storage URL: ${file}`);
  }

  if (lower.includes("mk-products")) {
    fail(`Public buyer file references mk-products: ${file}`);
  }

  if (lower.includes("raw kk")) {
    fail(`Public buyer file exposes raw KK language: ${file}`);
  }

  if (lower.includes("kk-kombo") || lower.includes("kk combo") || lower.includes("kk-combo")) {
    fail(`Public buyer file exposes KK-Kombo language by default: ${file}`);
  }

  const hasAudio =
    lower.includes("<audio") ||
    lower.includes("audiourl") ||
    lower.includes("src=");

  if (hasAudio && !lower.includes("/ii-delivery/")) {
    fail(`Public buyer file has audio without /ii-delivery/: ${file}`);
  }
}

if (failed) {
  console.error("");
  console.error("RAW KK AUDIO NEVER PUBLIC AUDIT: FAIL");
  process.exit(1);
}

console.log("RAW KK AUDIO NEVER PUBLIC AUDIT: PASS");
console.log(`Public buyer files checked: ${publicBuyerFiles.length}`);
