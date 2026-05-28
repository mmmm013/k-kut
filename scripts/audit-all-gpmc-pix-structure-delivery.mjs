import fs from "node:fs";
import path from "node:path";

const ROOTS = [
  "public",
  "data",
  "manifests",
];

const banned = [
  "-cc-",
  "feelline",
  "linefeel",
  "lnduo",
  "lntrio",
  "pime",
  "rmst",
  "mkut",
  "m-kut",
  "micro",
  "instrumental",
  "instro",
  "non-vocal",
  "non vocal",
  "no vocal",
];

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, acc);
    else acc.push(p);
  }
  return acc;
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}

function flatten(x, out = []) {
  if (!x) return out;
  if (Array.isArray(x)) {
    for (const item of x) flatten(item, out);
    return out;
  }
  if (typeof x === "object") {
    out.push(x);
    for (const v of Object.values(x)) {
      if (v && typeof v === "object") flatten(v, out);
    }
  }
  return out;
}

function audioUrl(row) {
  for (const key of ["audio_url", "audioUrl", "audio_src", "audioSrc", "previewSrc", "url", "src"]) {
    const v = row?.[key];
    if (typeof v === "string" && /\.(mp3|m4a|wav)$/i.test(v)) return v;
  }
  return "";
}

function localPublic(url) {
  if (!url) return "";
  if (url.startsWith("public/")) return url;
  if (url.startsWith("/")) return path.join("public", url.replace(/^\//, ""));
  return url;
}

function hasStructure(row) {
  return Boolean(row?.section || row?.song_section || row?.structure || row?.role);
}

function isCustomerKK(row) {
  const blob = JSON.stringify(row || {}).toLowerCase();
  if (banned.some((x) => blob.includes(x))) return false;
  return Boolean(row?.id && hasStructure(row) && audioUrl(row));
}

const jsonFiles = ROOTS.flatMap((r) => walk(r)).filter((f) => /\.json$/i.test(f));

const failures = [];
const passes = [];

for (const file of jsonFiles) {
  const json = readJson(file);
  if (!json) continue;

  for (const row of flatten(json)) {
    if (!isCustomerKK(row)) continue;

    const url = audioUrl(row);
    const local = localPublic(url);

    const record = {
      manifest: file,
      id: row.id,
      section: row.section || row.song_section || row.structure || row.role,
      audio_url: url,
      local,
    };

    if (!fs.existsSync(local)) failures.push(record);
    else passes.push(record);
  }
}

fs.mkdirSync("reports", { recursive: true });

fs.writeFileSync(
  "reports/all-gpmc-pix-structure-delivery-audit.json",
  JSON.stringify({ passes, failures }, null, 2) + "\n"
);

console.log("# ALL GPMC PIX STRUCTURE DELIVERY AUDIT");
console.log(`PASS: ${passes.length}`);
console.log(`FAIL: ${failures.length}`);

if (failures.length) {
  console.error("\nFAILED STRUCTURE DELIVERY BINDINGS:");
  for (const f of failures) {
    console.error(`- ${f.id} | ${f.section} | ${f.audio_url} | ${f.manifest}`);
  }
  process.exit(1);
}

console.log("\nALL GPMC PIX STRUCTURE DELIVERY AUDIT: PASS");
