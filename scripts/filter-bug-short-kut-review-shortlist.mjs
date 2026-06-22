import fs from "node:fs";
import path from "node:path";

const IN = "data/kut-inventory/review/bug-short-kut-candidate-review.json";
const OUT_JSON = "data/kut-inventory/review/bug-short-kut-review-shortlist.json";
const OUT_MD = "data/kut-inventory/review/bug-short-kut-review-shortlist.md";

if (!fs.existsSync(IN)) {
  throw new Error(`Missing raw BUG candidate queue: ${IN}`);
}

const raw = JSON.parse(fs.readFileSync(IN, "utf8"));
const candidates = raw.candidates || [];

const HARD_EXCLUDE = [
  "/audio-system/",
  "/voices/gp-bot/",
  "/mc-bot/",
  "/review-cuts/",
  "/_work/",
  "/_system/",
  "lead-padding",
  "tail-padding",
  "padding-",
  "/_system/",
  "lead-padding",
  "tail-padding",
  "padding-",
  "/_system/",
  "lead-padding",
  "tail-padding",
  "padding-",
  "start-silence",
  "twinkle",
  "reverse-raw",
  "opening-twinkle",
  "coming-soon",
  "play-demo",
  "pick-song",
  "pick-one",
  "pick-kind",
  "start-hug",
  "live 2.m4a",
  "live.m4a"
];

function cleanKey(file) {
  return file
    .replace(/ 2(\.[a-z0-9]+)$/i, "$1")
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function durationOk(c) {
  const d = Number(c.durationSeconds);
  if (!Number.isFinite(d)) return true;
  return d >= 1.5 && d <= 12;
}

function isSystemJunk(c) {
  const s = String(c.sourceAudioFile || "").toLowerCase();
  return HARD_EXCLUDE.some(x => s.includes(x.toLowerCase()));
}

function isPlausible(c) {
  const s = String(c.sourceAudioFile || "").toLowerCase();

  if (isSystemJunk(c)) return false;
  if (!durationOk(c)) return false;

  // Keep likely real audio buckets first.
  if (s.includes("/kks/")) return true;
  if (s.includes("/kuts/")) return true;
  if (s.includes("/mkut/")) return true;
  if (s.includes("/mothers-day/")) return true;
  if (s.includes("/fathers-day/")) return true;
  if (s.includes("/hugs/")) return true;
  if (s.includes("/slds-r2/ikk/")) return true;

  return false;
}

const seen = new Set();
const shortlist = [];

for (const c of candidates) {
  if (!isPlausible(c)) continue;

  const key = cleanKey(c.sourceAudioFile || "");
  if (seen.has(key)) continue;
  seen.add(key);

  shortlist.push({
    ...c,
    reviewStatus: "needs-human-audio-review",
    shortlistReason: "filtered from raw BUG candidate queue; obvious system/silence/twinkle/bot audio removed",
    approvalDecision: "pending",
    approvalBlockedUntil: [
      "Human listens to audio.",
      "Human confirms tiny Short-KUT use.",
      "Human confirms BUG-safe tone.",
      "Human confirms no pressure/guilt/control/harassment.",
      "Human confirms neutral KUT canonicalization path."
    ]
  });
}

shortlist.sort((a,b) => {
  const lane = String(a.bugLane || "").localeCompare(String(b.bugLane || ""));
  if (lane) return lane;
  const ad = Number(a.durationSeconds || 999);
  const bd = Number(b.durationSeconds || 999);
  return ad - bd || String(a.sourceAudioFile).localeCompare(String(b.sourceAudioFile));
});

const out = {
  version: 1,
  role: "Filtered BUG Short-KUT review shortlist",
  sourceQueue: IN,
  generatedAt: new Date().toISOString(),
  ownsAudio: false,
  publicLaunchAllowedFromThisQueue: false,
  approvalRequired: true,
  rawCandidateCount: candidates.length,
  shortlistCount: shortlist.length,
  launchMinimumRecommended: 15,
  targetInventoryRecommended: 30,
  shortlist
};

fs.writeFileSync(OUT_JSON, JSON.stringify(out, null, 2) + "\n");

let md = "# Filtered BUG Short-KUT Review Shortlist\n\n";
md += `Raw candidates: ${out.rawCandidateCount}\n\n`;
md += `Shortlist count: ${out.shortlistCount}\n\n`;
md += "These are **not approved BUGs**. This is the cleaner human review list after removing obvious system audio, silence, twinkles, bot prompts, duplicates, and review cuts.\n\n";

for (const [i, c] of shortlist.entries()) {
  md += `## ${i + 1}. ${c.bugLane}\n\n`;
  md += `- File: \`${c.sourceAudioFile}\`\n`;
  md += `- URL: \`${c.sourceAudioUrl}\`\n`;
  md += `- Duration: ${c.durationSeconds ?? "unknown"}\n`;
  md += `- Status: ${c.reviewStatus}\n`;
  md += `- Decision: ${c.approvalDecision}\n\n`;
}

fs.writeFileSync(OUT_MD, md.trimEnd() + "\n");

console.log("FILTERED BUG SHORT-KUT REVIEW SHORTLIST BUILT");
console.log(`Raw candidates: ${out.rawCandidateCount}`);
console.log(`Shortlist count: ${out.shortlistCount}`);
console.log(OUT_JSON);
console.log(OUT_MD);

console.log("");
console.log("TOP 60 SHORTLIST:");
for (const c of shortlist.slice(0, 60)) {
  console.log(`${c.durationSeconds ?? "?"}s | ${c.bugLane} | ${c.sourceAudioFile}`);
}
