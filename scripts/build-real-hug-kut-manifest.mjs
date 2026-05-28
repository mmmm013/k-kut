import fs from "node:fs";
import path from "node:path";

const OUT = "lib/hugRealKutManifest.ts";

const SOURCES = [
  "public/mothers-day/thank-you/kks-expanded/manifest.json",
  "public/mothers-day/thank-you/kks/manifest.json",
];

const THANK_YOU_ROLES = [
  {
    role: "VERSE_1",
    label: "Verse 1 K-KUT",
    allow: [/verse 1|v1a|v1b|v1c|v1d/i],
    rejectExactIntroOnly: true,
  },
  {
    role: "CHORUS_1",
    label: "Chorus 1 K-KUT",
    allow: [/chorus 1|ch1/i],
    reject: [/intro through/i],
  },
  {
    role: "VERSE_2",
    label: "Verse 2 K-KUT",
    allow: [/verse 2|v2a|v2b/i],
    reject: [/through outro/i],
  },
  {
    role: "BRIDGE",
    label: "Bridge K-KUT",
    allow: [/bridge/i],
  },
  {
    role: "CHORUS_2",
    label: "Chorus 2 K-KUT",
    allow: [/chorus 2|ch2/i],
    reject: [/through outro/i],
  },
  {
    role: "OUTRO",
    label: "Outro K-KUT",
    allow: [/outro/i],
    reject: [/verse 2.*through outro|v2b through outro|chorus 2 through outro/i],
  },
  {
    role: "KOMBO_INTRO_V1_CH1",
    label: "KK-Kombo: Intro + Verse 1 + Chorus 1",
    allow: [/intro.*chorus 1|intro through chorus 1|intro.*v1.*ch1/i],
    kombo: true,
  },
  {
    role: "KOMBO_V2_CH2_OUTRO",
    label: "KK-Kombo: Verse 2 + Chorus 2 + Outro",
    allow: [/verse 2.*outro|v2.*outro|chorus 2 through outro|v2b through outro/i],
    kombo: true,
  },
];

function readRows(file) {
  if (!fs.existsSync(file)) return [];
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  return (data.kks || []).map((row) => ({ ...row, kkSourceFile: file }));
}

function audioExists(url) {
  if (!url) return false;
  const local = path.join("public", url.replace(/^\//, ""));
  return fs.existsSync(local) && fs.statSync(local).size > 200_000;
}

function blob(row) {
  return `${row.id || ""} ${row.title || ""} ${row.section || ""} ${row.notes || ""}`;
}

function isInternalWrongClass(row) {
  const s = JSON.stringify(row).toLowerCase();
  return [
    "cc",
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
  ].some((x) => s.includes(x));
}

function isIntroOnly(row) {
  const section = String(row.section || "").trim().toLowerCase();
  return section === "intro" || section === "introduction" || section === "intro only" || section === "intro-only";
}

function findForRole(role, rows) {
  const found = rows.filter((row) => {
    if (isInternalWrongClass(row)) return false;
    if (isIntroOnly(row)) return false;
    if (!audioExists(row.audio_url)) return false;

    const text = blob(row);
    const ok = role.allow.some((rx) => rx.test(text));
    const rejected = (role.reject || []).some((rx) => rx.test(text));
    return ok && !rejected;
  });

  found.sort((a, b) => {
    const ae = a.kkSourceFile.includes("kks-expanded") ? 0 : 1;
    const be = b.kkSourceFile.includes("kks-expanded") ? 0 : 1;
    return ae - be;
  });

  return found[0] || null;
}

const allRows = SOURCES.flatMap(readRows);
const selected = [];

for (const role of THANK_YOU_ROLES) {
  const row = findForRole(role, allRows);
  if (!row) {
    console.error(`STOP: missing required Thank You KK role ${role.role}`);
    console.error("Available KK sections:");
    for (const r of allRows) console.error(`- ${r.id}: ${r.section}`);
    process.exit(1);
  }

  selected.push({
    id: `${row.id}-${role.role.toLowerCase()}`,
    kkId: row.id,
    role: role.role,
    label: role.label,
    fit: role.kombo
      ? "Contiguous KK-Kombo from the SSOT track."
      : "Song-section K-KUT from the SSOT track.",
    section: row.section,
    previewSrc: row.audio_url,
    source: role.kombo ? "KK_KOMBO_CONTIGUOUS" : "KK_SECTION_ONLY",
    kkSourceFile: row.kkSourceFile,
  });
}

const output = `export const realHugKuts = {
  thanks: ${JSON.stringify(selected, null, 2)}
} as const;

export type RealHugKut = typeof realHugKuts.thanks[number];
`;

fs.writeFileSync(OUT, output);
console.log(`WROTE ${OUT} with ${selected.length} curated Thank You KKs/Kombos`);
for (const row of selected) {
  console.log(`${row.role}: ${row.section} — ${row.previewSrc}`);
}
