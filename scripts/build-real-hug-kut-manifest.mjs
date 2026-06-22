import fs from "node:fs";
import path from "node:path";

const OUT = "lib/hugRealKutManifest.ts";
const SOURCE = "public/kks/thank-you/kks-expanded/manifest.json";

const LOCKED_THANK_YOU_KKS = [
  "thank-you-sec-v1a",
  "thank-you-sec-v1b",
  "thank-you-sec-prech1",
  "thank-you-sec-ch1",
  "thank-you-sec-v2a",
  "thank-you-sec-v2b",
  "thank-you-sec-br",
  "thank-you-sec-ch2",
  "thank-you-sec-outro",
];

function audioExists(url) {
  if (!url) return false;
  return fs.existsSync(path.join("public", url.replace(/^\//, "")));
}

function banned(row) {
  const s = JSON.stringify(row || {}).toLowerCase();
  return [
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
    "no vocal"
  ].some((bad) => s.includes(bad));
}

const data = JSON.parse(fs.readFileSync(SOURCE, "utf8"));
const rows = data.kks || [];

const selected = LOCKED_THANK_YOU_KKS.map((id) => {
  const row = rows.find((x) => x.id === id);

  if (!row) {
    console.error(`STOP: missing locked structure KK ${id}`);
    process.exit(1);
  }

  if (banned(row)) {
    console.error(`STOP: locked KK contains banned marker ${id}`);
    process.exit(1);
  }

  if (!audioExists(row.audio_url)) {
    console.error(`STOP: missing audio delivery file for ${id}: ${row.audio_url}`);
    process.exit(1);
  }

  return {
    id: row.id,
    kkId: row.id,
    label: row.title || row.section || row.id,
    fit: "Locked Thank You text-structure K-KUT from SSOT.",
    section: row.section,
    previewSrc: row.audio_url,
    source: "KK_STRUCTURE_LOCKED",
    kkSourceFile: SOURCE,
  };
});

fs.writeFileSync(
  OUT,
  `export const realHugKuts = {
  thanks: ${JSON.stringify(selected, null, 2)}
} as const;

export type RealHugKut = typeof realHugKuts.thanks[number];
`
);

console.log(`WROTE ${OUT} with ${selected.length} locked Thank You structure KKs`);
for (const row of selected) console.log(`${row.id}: ${row.section} — ${row.previewSrc}`);
