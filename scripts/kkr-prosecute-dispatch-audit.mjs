import fs from "node:fs";
import path from "node:path";

const ROOTS = ["public", "data", "manifests"];
const OUT = "reports/kkr-dispatch/kkr-prosecute-dispatch-audit.json";

const INTERNAL_MARKERS = [
  "-cc-",
  "cc_ready",
  "line-cc",
  "feelline",
  "linefeel",
  "lnduo",
  "lntrio",
  "pime",
  "rmst",
  "mkut",
  "m-kut",
  "micro",
  "micros",
];

const BANNED_CUSTOMER_MARKERS = [
  "generic audio",
  "public/audio/",
  "sandman",
  "magic-tail",
  "magic-tails",
  "magic-tests",
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
    else if (/\.json$/i.test(ent.name)) acc.push(p);
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

function flatten(value, out = []) {
  if (!value) return out;

  if (Array.isArray(value)) {
    for (const item of value) flatten(item, out);
    return out;
  }

  if (typeof value === "object") {
    out.push(value);
    for (const child of Object.values(value)) {
      if (child && typeof child === "object") flatten(child, out);
    }
  }

  return out;
}

function audioUrl(row) {
  for (const key of ["audio_url", "audioUrl", "audio_src", "audioSrc", "previewSrc", "url", "src"]) {
    const value = row?.[key];
    if (typeof value === "string" && /\.(mp3|m4a|wav)$/i.test(value)) return value;
  }
  return "";
}

function localPath(url) {
  if (!url) return "";
  if (url.startsWith("public/")) return url;
  if (url.startsWith("/")) return path.join("public", url.replace(/^\//, ""));
  return url;
}

function canonicalStructure(value) {
  const s = String(value || "").trim().toLowerCase();
  if (s === "bridge" || s === "br") return "br";
  return s;
}

function hasStructure(row) {
  return Boolean(row?.section || row?.song_section || row?.structure || row?.role);
}

function blob(row) {
  return JSON.stringify(row || {}).toLowerCase();
}

function isInternal(row) {
  const s = blob(row);
  return INTERNAL_MARKERS.some((x) => s.includes(x));
}

function isBannedCustomer(row) {
  const s = blob(row);
  return BANNED_CUSTOMER_MARKERS.some((x) => s.includes(x));
}

function looksCustomerKK(row) {
  const id = String(row?.id || "");
  const url = audioUrl(row);

  if (!id || !url) return false;
  if (!hasStructure(row)) return false;
  if (isInternal(row)) return false;

  return (
    id.includes("kk") ||
    id.includes("k-kut") ||
    id.includes("kut") ||
    id.includes("-sec-") ||
    row.source === "KK_STRUCTURE_LOCKED" ||
    row.source === "KK_STRUCTURE_DISPATCHED"
  );
}

const jsonFiles = ROOTS.flatMap((root) => walk(root));
const prosecuted = [];
const blockers = [];
const passed = [];

for (const file of jsonFiles) {
  const json = readJson(file);
  if (!json) continue;

  for (const row of flatten(json)) {
    if (!row || typeof row !== "object") continue;

    const record = {
      source_manifest: file,
      id: row.id || "",
      section: row.section || row.song_section || row.structure || row.role || "",
      audio_url: audioUrl(row),
      customer_candidate: looksCustomerKK(row),
      internal: isInternal(row),
      banned_customer_marker: isBannedCustomer(row),
    };

    if (!record.customer_candidate) continue;

    const local = localPath(record.audio_url);
    record.local_audio = local;
    record.delivery_exists = Boolean(local && fs.existsSync(local));

    prosecuted.push(record);

    if (record.banned_customer_marker) {
      blockers.push({ ...record, failure: "BANNED_CUSTOMER_MARKER" });
      continue;
    }

    if (!record.delivery_exists) {
      blockers.push({ ...record, failure: "MISSING_DELIVERY_AUDIO" });
      continue;
    }

    passed.push(record);
  }
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });

const report = {
  status: blockers.length ? "FAIL" : "PASS",
  prosecuted_total: prosecuted.length,
  passed_total: passed.length,
  blocker_total: blockers.length,
  blockers,
  passed,
};

fs.writeFileSync(OUT, JSON.stringify(report, null, 2) + "\n");

console.log("# KKr PROSECUTE + DISPATCH AUDIT");
console.log(`PROSECUTED: ${prosecuted.length}`);
console.log(`PASS: ${passed.length}`);
console.log(`FAIL: ${blockers.length}`);

if (blockers.length) {
  console.error("\nBLOCKERS:");
  for (const b of blockers) {
    console.error(`- ${b.failure}: ${b.id} | ${b.section} | ${b.audio_url} | ${b.source_manifest}`);
  }
  process.exit(1);
}

console.log("\nKKr PROSECUTE + DISPATCH AUDIT: PASS");
