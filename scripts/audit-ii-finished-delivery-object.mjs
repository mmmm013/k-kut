import fs from "node:fs";

let failed = false;
let warned = false;

function fail(msg) {
  console.error("FAIL:", msg);
  failed = true;
}

function warn(msg) {
  console.warn("WARN:", msg);
  warned = true;
}

function read(file) {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return "";
  }
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

console.log("II FINISHED DELIVERY OBJECT AUDIT");

const publicFiles = walk("public/ii-delivery").filter((file) =>
  /\.(mp3|wav|m4a|aiff|aif)$/i.test(file)
);

if (!publicFiles.length) {
  fail("No public II delivery audio files found.");
}

for (const file of publicFiles) {
  const lower = file.toLowerCase();

  if (!lower.includes("bookend-twinkle")) {
    fail(`Public II file missing bookend-twinkle marker: ${file}`);
  }

  if (!lower.includes("public/ii-delivery/")) {
    fail(`Public II file outside public/ii-delivery: ${file}`);
  }

  const stat = fs.statSync(file);
  if (stat.size <= 0) {
    fail(`Public II file is empty: ${file}`);
  }
}

const appFiles = walk("app").filter((file) => /\.(tsx|ts|jsx|js)$/i.test(file));

const publicBuyerFiles = appFiles.filter((file) =>
  file.includes("app/personal") ||
  file.includes("app/holiday") ||
  file.includes("app/romance") ||
  file.includes("app/kupid") ||
  file.includes("app/wedding")
);

for (const file of publicBuyerFiles) {
  const text = read(file);
  const lower = text.toLowerCase();

  if (lower.includes("supabase.co/storage")) {
    fail(`Public buyer page references Supabase storage/source URL: ${file}`);
  }

  if (lower.includes("mk-products")) {
    fail(`Public buyer page references mk-products: ${file}`);
  }

  if (lower.includes("appendtwinkle") || lower.includes("append_twinkle") || lower.includes("runtime twinkle")) {
    fail(`Public buyer page appears to append Twinkle at runtime: ${file}`);
  }

  const hasAudio = lower.includes("<audio") || lower.includes("audioUrl".toLowerCase()) || lower.includes("src=");
  const hasIi = lower.includes("/ii-delivery/");

  if (hasAudio && !hasIi) {
    fail(`Public buyer page has audio but no /ii-delivery/ source: ${file}`);
  }
}

/*
  Candidate registries are allowed to contain "needs_bookend_twinkle".
  That means: not finished yet. Not public yet.

  Finished public II proof comes from:
  - public/ii-delivery files
  - buyer pages referencing only /ii-delivery/*bookend-twinkle*
*/
const registryFiles = walk("data/ii-delivery-registry").filter((file) =>
  /\.(json|md)$/i.test(file)
);

for (const file of registryFiles) {
  const text = read(file);
  const lower = text.toLowerCase();

  if (lower.includes("delivery_status") && lower.includes("needs_bookend_twinkle")) {
    warn(`Candidate registry contains needs_bookend_twinkle, not finished II: ${file}`);
  }

  if (lower.includes("ii_delivery_src") && !lower.includes("bookend-twinkle")) {
    fail(`Registry has ii_delivery_src without bookend-twinkle marker: ${file}`);
  }
}

if (failed) {
  console.error("");
  console.error("II FINISHED DELIVERY OBJECT AUDIT: FAIL");
  process.exit(1);
}

console.log("");
console.log("II FINISHED DELIVERY OBJECT AUDIT: PASS");
console.log(`Public II files checked: ${publicFiles.length}`);
console.log(`Public buyer files checked: ${publicBuyerFiles.length}`);
console.log(`Registry files checked: ${registryFiles.length}`);
console.log(`Candidate registry warnings: ${warned ? "YES" : "NO"}`);
