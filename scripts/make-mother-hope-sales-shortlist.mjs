import fs from "node:fs";

const inputPath = "reports/ii-candidates/mother-hope-kk-candidates.json";
const outJson = "reports/ii-candidates/mother-hope-sales-shortlist.public.json";
const outMd = "reports/ii-candidates/mother-hope-sales-shortlist.public.md";

if (!fs.existsSync(inputPath)) {
  console.error("Missing input:", inputPath);
  process.exit(1);
}

const source = JSON.parse(fs.readFileSync(inputPath, "utf8"));

const hardForbidden = [
  "music maykers",
  "instro",
  "instrumental",
  "christmas",
  "xmas",
  "valentine",
  "mother's day",
  "mothers day",
  "father's day",
  "fathers day",
  "lt-pix",
  "mk",
  "mini-kut",
  "mini",

  // Block generic romance titles from Mother/Hope income path.
  "a love like that",
  "don't call it love",
  "dont call it love",
  "believe in love",
];

// STRICT: do not use generic “love” or “heart” as enough for Mother/Hope.
const strongMotherHopeTerms = [
  "mother",
  "mom",
  "mum",
  "mama",
  "momma",
  "hope",
  "thank",
  "thanks",
  "grateful",
  "gratitude",
  "guide",
  "shelter",
  "comfort",
  "carry",
  "light",
  "support"
];

function hasAny(text, terms) {
  const t = String(text || "").toLowerCase();
  return terms.some((term) => t.includes(term));
}

function cleanPublicLabel(s) {
  return String(s || "")
    .replace(/^\s*\d+\s*-\s*/g, "")
    .replace(/\bMusic Maykers\b/gi, "")
    .replace(/\bLT-PIX\b/gi, "")
    .replace(/\.mp3$/gi, "")
    .replace(/\.wav$/gi, "")
    .replace(/\s+—\s+KK\s+\d+$/i, "")
    .replace(/\s+-\s+/g, " - ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function feelingFromText(text) {
  const t = String(text || "").toLowerCase();

  if (/\bthank|thanks|grateful|gratitude/.test(t)) return "Deep Thanks";
  if (/\bmother|mom|mum|mama|momma/.test(t)) return "For Mom";
  if (/\bhope|light|believe|faith|carry/.test(t)) return "Hope / Comfort";
  if (/\bguide|shelter|comfort|support|hold|care/.test(t)) return "Warm Support";
  return "Needs Admin Review";
}

const all = [];

for (const items of Object.values(source.groups || {})) {
  for (const item of items || []) {
    const publicTitle = cleanPublicLabel(item.public_title_candidate);
    const publicSource = cleanPublicLabel(item.public_source_label);
    // IMPORTANT: do NOT include item.emotion_level here.
    // Prior bug: emotion_level "light" matched the keyword "light",
    // which pulled generic romance titles into Mother/Hope.
    const hay = `${publicTitle} ${publicSource}`;

    if (hasAny(hay, hardForbidden)) continue;
    if (!hasAny(hay, strongMotherHopeTerms)) continue;

    const displayFeeling = feelingFromText(hay);
    if (displayFeeling === "Needs Admin Review") continue;

    all.push({
      kk_id: item.id,
      display_feeling: displayFeeling,
      public_label: publicTitle,
      start_seconds: item.start_seconds,
      end_seconds: item.end_seconds,
      duration_seconds: item.duration_seconds,
      emotion_level: item.emotion_level,
      reuse_status: "existing_pre_made_kk",
      duplicate_policy: "do_not_remint",
      delivery_status: "needs_bookend_twinkle_materialization"
    });
  }
}

const seen = new Set();
const deduped = [];

for (const item of all) {
  const key = `${item.public_label}|${item.start_seconds}|${item.end_seconds}|${item.display_feeling}`;
  if (seen.has(key)) continue;
  seen.add(key);
  deduped.push(item);
}

const rankFeeling = {
  "Deep Thanks": 0,
  "For Mom": 1,
  "Hope / Comfort": 2,
  "Warm Support": 3
};

deduped.sort((a, b) => {
  return (rankFeeling[a.display_feeling] ?? 9) - (rankFeeling[b.display_feeling] ?? 9)
    || String(a.public_label).localeCompare(String(b.public_label))
    || (a.start_seconds ?? 999999) - (b.start_seconds ?? 999999);
});

const shortlist = deduped.slice(0, 24);

const publicReport = {
  report: "mother-hope-sales-shortlist-public",
  status: shortlist.length ? "ready_for_admin_audio_review" : "blocked_no_strict_candidates",
  laws_applied: [
    "KK only",
    "NO INSTRO",
    "NO direct same-holiday LT-PIX",
    "NO Music Maykers in public shortlist",
    "NO mKs without ADMIN override",
    "NO duplicate II",
    "Generic love/heart/light scoring matches are not enough for Mother/Hope",
    "Delivery audio still requires front padding, back padding, and Twinkle"
  ],
  total_public_shortlist: shortlist.length,
  candidates: shortlist
};

fs.writeFileSync(outJson, JSON.stringify(publicReport, null, 2) + "\n");

let md = "# Mother / Hope Sales Shortlist\n\n";
md += `Status: ${publicReport.status}\n\n`;
md += "Public-safe rules: KK only. No INSTRO. No direct same-holiday LT-PIX. No Music Maykers. No mKs. No duplicate II.\n";
md += "Matching rule: generic love/heart/light scoring matches are not enough.\n\n";
md += "Delivery rule: selected KKs must be materialized with front padding, back padding, and Twinkle before customer delivery.\n\n";

for (const c of shortlist) {
  md += `- ${c.display_feeling} | ${c.start_seconds}-${c.end_seconds}s | ${c.public_label} | kk=${c.kk_id}\n`;
}

fs.writeFileSync(outMd, md);

console.log("Strict Mother/Hope public sales shortlist created.");
console.log("Candidates:", shortlist.length);
console.log("JSON:", outJson);
console.log("MD:", outMd);
