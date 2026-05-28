import fs from "node:fs";
import path from "node:path";

const OUT = "lib/hugRealKutManifest.ts";

const ALLOWED_KK_SOURCES = [
  "public/mothers-day/thank-you/kks/manifest.json",
  "public/mothers-day/thank-you/kks-expanded/manifest.json",
  "data/holiday-kks/mothers-day-thank-you-kks.json",
  "data/holiday-kks/mothers-day-promo-sets.json",
];

const BANNED_SOURCE_MARKERS = [
  "line-cc",
  "cc-ready",
  "cc-hold",
  "lnduo",
  "lntrio",
  "pime",
  "rmst",
  "mkut",
  "m-kut",
  "micro",
  "micros",
];

const BANNED_ITEM_MARKERS = [
  "intro",
  "intro-only",
  "intro only",
  "instrumental",
  "instro",
  "no vocal",
  "non-vocal",
  "non vocal",
];

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

function findAudioUrl(row) {
  const keys = [
    "previewSrc",
    "preview_src",
    "audioSrc",
    "audio_src",
    "audioUrl",
    "audio_url",
    "url",
    "src",
    "publicUrl",
    "public_url",
    "file",
    "path",
  ];

  for (const key of keys) {
    const value = row?.[key];
    if (typeof value === "string" && /\.(mp3|m4a|wav)(\?|$)/i.test(value)) {
      return value.startsWith("/") ? value : "/" + value.replace(/^public\//, "");
    }
  }

  for (const value of Object.values(row || {})) {
    if (typeof value === "string" && /\.(mp3|m4a|wav)(\?|$)/i.test(value)) {
      return value.startsWith("/") ? value : "/" + value.replace(/^public\//, "");
    }
  }

  return null;
}

function localPublicFile(url) {
  return path.join("public", url.replace(/^\//, ""));
}

function textBlob(row, sourceFile) {
  return `${sourceFile}\n${JSON.stringify(row || {})}`.toLowerCase();
}

function isAllowedSource(file) {
  const lower = file.toLowerCase();
  return !BANNED_SOURCE_MARKERS.some((x) => lower.includes(x));
}

function isTrueKK(row, sourceFile) {
  const blob = textBlob(row, sourceFile);

  if (!isAllowedSource(sourceFile)) return false;
  if (BANNED_SOURCE_MARKERS.some((x) => blob.includes(x))) return false;
  if (BANNED_ITEM_MARKERS.some((x) => blob.includes(x))) return false;

  // Must come from an allowed KK source file.
  if (!ALLOWED_KK_SOURCES.includes(sourceFile)) return false;

  // Must identify as KK/K-KUT/KUT, not a generic audio/micro/CC.
  const identityOk =
    blob.includes("kk") ||
    blob.includes("k-kut") ||
    blob.includes("kut") ||
    sourceFile.includes("/kks/") ||
    sourceFile.includes("/kks-expanded/") ||
    sourceFile.includes("holiday-kks");

  if (!identityOk) return false;

  const url = findAudioUrl(row);
  if (!url) return false;

  const local = localPublicFile(url);
  if (!fs.existsSync(local)) return false;

  // Avoid tiny lead-ins.
  if (fs.statSync(local).size < 200_000) return false;

  return true;
}

function pickLabel(row, i) {
  return (
    row.label ||
    row.title ||
    row.name ||
    row.kut_label ||
    row.kk_label ||
    `Thank-you K-KUT ${i + 1}`
  );
}

function pickFit(row) {
  return (
    row.fit ||
    row.description ||
    row.intent ||
    row.use ||
    "Vocal K-KUT thank-you option."
  );
}

function pickSection(row) {
  const value =
    row.section ||
    row.section_label ||
    row.excerpt ||
    row.part ||
    row.structure ||
    "Vocal K-KUT excerpt";

  return String(value).replace(/\bintro\b/gi, "").trim() || "Vocal K-KUT excerpt";
}

const rows = [];

for (const sourceFile of ALLOWED_KK_SOURCES) {
  if (!fs.existsSync(sourceFile)) continue;

  const data = readJson(sourceFile);
  const objects = flatten(data);

  for (const row of objects) {
    if (!isTrueKK(row, sourceFile)) continue;

    const previewSrc = findAudioUrl(row);
    rows.push({
      id: row.id || row.kk_id || row.kut_id || `kk-${rows.length + 1}`,
      label: pickLabel(row, rows.length),
      fit: pickFit(row),
      section: pickSection(row),
      previewSrc,
      source: "KK_ONLY",
      kkSourceFile: sourceFile,
    });
  }
}

const dedup = new Map();
for (const row of rows) {
  const key = row.previewSrc;
  if (!dedup.has(key)) dedup.set(key, row);
}

const selected = [...dedup.values()].slice(0, 8);

if (selected.length < 8) {
  console.error(`STOP: only ${selected.length} valid KK-only HUG options found. Need 8.`);
  console.error("Found:");
  for (const row of selected) {
    console.error(`- ${row.label} :: ${row.previewSrc} :: ${row.kkSourceFile}`);
  }
  process.exit(1);
}

const output = `export const realHugKuts = {
  thanks: ${JSON.stringify(selected, null, 2)}
} as const;

export type RealHugKut = typeof realHugKuts.thanks[number];
`;

fs.writeFileSync(OUT, output);
console.log(`WROTE ${OUT} with 8 KK-only vocal HUG options`);
for (const row of selected) {
  console.log(`${row.id}: ${row.label} — ${row.previewSrc} — ${row.kkSourceFile}`);
}
