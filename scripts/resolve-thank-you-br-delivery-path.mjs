import fs from "node:fs";
import path from "node:path";

const DEST = "public/mothers-day/thank-you/kks-expanded/thank-you-sec-br.mp3";
const DEST_URL = "/mothers-day/thank-you/kks-expanded/thank-you-sec-br.mp3";
const MANIFEST = "public/mothers-day/thank-you/kks-expanded/manifest.json";

const ROOTS = ["manifests", "data", "reports", "public/mothers-day/thank-you"];

const BANNED_PATH = [
  "sandman",
  "magic-tail",
  "magic-tails",
  "magic-tests",
  "-cc-",
  "linefeel",
  "feelline",
  "micro",
  "mkut",
  "m-kut"
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

function localPath(ref) {
  if (!ref || typeof ref !== "string") return null;
  if (!/\.(mp3|m4a|wav)$/i.test(ref)) return null;
  if (ref.startsWith("public/")) return ref;
  if (ref.startsWith("/")) return path.join("public", ref.replace(/^\//, ""));
  return ref;
}

function bannedPath(file) {
  const lower = String(file || "").toLowerCase();
  return BANNED_PATH.some((bad) => lower.includes(bad));
}

function audioRefsFromObject(obj) {
  const refs = [];
  for (const [key, value] of Object.entries(obj || {})) {
    if (typeof value !== "string") continue;
    if (!/\.(mp3|m4a|wav)$/i.test(value)) continue;
    if (!/(audio|src|url|file|path)/i.test(key)) continue;
    refs.push(value);
  }
  return refs;
}

function isBrObject(obj) {
  const id = String(obj.id || "").trim().toLowerCase();
  const title = String(obj.title || obj.user_display_title || "").trim();
  const section = String(obj.section || obj.song_section || "").trim();
  const songSection = String(obj.song_section || "").trim().toLowerCase();

  if (id === "thank-you-sec-br") return true;
  if (songSection === "br") return true;
  if (section === "Br") return true;
  if (title === "Br") return true;

  const blob = JSON.stringify(obj || "").toLowerCase();
  return (
    blob.includes("we've been through valleys") ||
    blob.includes("we’ve been through valleys") ||
    blob.includes("scaled mountains") ||
    blob.includes("your love will always remain")
  );
}

if (fs.existsSync(DEST)) {
  console.log(`PASS: Br delivery file already exists: ${DEST}`);
  process.exit(0);
}

const candidates = [];

// 1. Exact file search first.
for (const root of ROOTS) {
  for (const file of walk(root)) {
    if (/thank-you-sec-br\.(mp3|m4a|wav)$/i.test(file) && !bannedPath(file) && fs.existsSync(file)) {
      candidates.push({
        reason: "exact file name",
        recordFile: file,
        localAudio: file
      });
    }
  }
}

// 2. Object-level metadata search only.
for (const root of ROOTS) {
  for (const file of walk(root)) {
    if (!/\.(json)$/i.test(file)) continue;

    const json = readJson(file);
    if (!json) continue;

    for (const obj of flatten(json)) {
      if (!obj || typeof obj !== "object") continue;
      if (!isBrObject(obj)) continue;

      for (const ref of audioRefsFromObject(obj)) {
        const local = localPath(ref);
        if (!local) continue;
        if (bannedPath(local)) continue;
        if (!fs.existsSync(local)) continue;

        candidates.push({
          reason: "Br object audio binding",
          recordFile: file,
          objectId: obj.id || "",
          localAudio: local
        });
      }
    }
  }
}

const unique = [];
const seen = new Set();
for (const c of candidates) {
  const key = c.localAudio;
  if (seen.has(key)) continue;
  seen.add(key);
  unique.push(c);
}

if (!unique.length) {
  console.error("STOP: no object-level pre-made Thank You Br audio artifact found.");
  console.error("The Br structure row exists, but no Br-specific audio source is bound in inventory.");
  console.error(`Required final delivery path: ${DEST}`);
  process.exit(1);
}

if (unique.length > 1) {
  console.error("STOP: multiple Br-specific audio artifacts found. Owner selection required.");
  for (const c of unique) {
    console.error(`- ${c.localAudio} [${c.reason}; record: ${c.recordFile}; object: ${c.objectId || "n/a"}]`);
  }
  process.exit(1);
}

const chosen = unique[0];

fs.mkdirSync(path.dirname(DEST), { recursive: true });
fs.copyFileSync(chosen.localAudio, DEST);

const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
const rows = manifest.kks || [];

const brRow = {
  id: "thank-you-sec-br",
  title: "Br",
  section: "Br",
  song_section: "br",
  audio_url: DEST_URL,
  notes: `Resolved by KKr delivery resolver from ${chosen.reason}: ${chosen.recordFile}`
};

manifest.kks = rows.filter((row) => row.id !== brRow.id);
manifest.kks.push(brRow);

fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");

console.log("Resolved Thank You Br delivery path.");
console.log(`source audio: ${chosen.localAudio}`);
console.log(`destination:  ${DEST}`);
