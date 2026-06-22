import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const ROOTS = ["public"];
const OUT_JSON = "data/kut-inventory/review/bug-short-kut-candidate-review.json";
const OUT_MD = "data/kut-inventory/review/bug-short-kut-candidate-review.md";

const AUDIO_EXT = new Set([".mp3", ".m4a", ".wav", ".aac"]);

const HARD_EXCLUDE = [
  "/source-audio/",
  "/internal-proof/",
  "/structure-review/",
  "/sound-study/",
  "/review/",
  "/tmp-",
  "/_BAD_DO_NOT_USE/",
  "/_system/",
  "/signature-tests/",
  "/opening-tests/"
];

const SOFT_BUG_WORDS = [
  "call",
  "text",
  "message",
  "remember",
  "love",
  "miss",
  "thinking",
  "check",
  "breathe",
  "you-got",
  "got-this",
  "dont-forget",
  "don-t-forget",
  "nudge",
  "poke",
  "hey",
  "cc"
];

function walk(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

function shell(args) {
  try {
    return execFileSync(args[0], args.slice(1), { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return "";
  }
}

function durationSeconds(file) {
  const ff = shell(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=nk=1:nw=1", file]);
  if (ff && Number.isFinite(Number(ff))) return Number(ff);

  const af = shell(["afinfo", file]);
  const m = af.match(/estimated duration:\s*([\d.]+)/i) || af.match(/duration:\s*([\d.]+)/i);
  if (m && Number.isFinite(Number(m[1]))) return Number(m[1]);

  return null;
}

function laneFor(file) {
  const s = file.toLowerCase();
  if (/call|text|message|phone/.test(s)) return "CALL_TEXT";
  if (/love|miss|thinking/.test(s)) return "LOVE";
  if (/remember|forget|reminder/.test(s)) return "REMEMBER";
  if (/check|breathe|okay|here/.test(s)) return "CHECK_IN";
  if (/got-this|you-got|keep-going|proud|almost/.test(s)) return "ENCOURAGE";
  if (/poke|nudge|hey|bug|cc/.test(s)) return "PLAYFUL";
  return "GENERAL_LIGHT_NUDGE";
}

const files = ROOTS.flatMap(walk)
  .filter((f) => AUDIO_EXT.has(path.extname(f).toLowerCase()))
  .filter((f) => !HARD_EXCLUDE.some((x) => f.includes(x)));

const candidates = [];

for (const file of files) {
  const lower = file.toLowerCase();
  const base = path.basename(lower);
  const size = fs.statSync(file).size;
  const dur = durationSeconds(file);
  const hasBugWord = SOFT_BUG_WORDS.some((w) => lower.includes(w));

  const tinyByDuration = dur !== null && dur > 0 && dur <= 12;
  const smallBySize = dur === null && size <= 350_000;
  const shortLikely = tinyByDuration || smallBySize || (hasBugWord && (dur === null || dur <= 20));

  if (!shortLikely) continue;

  candidates.push({
    reviewStatus: "needs-human-review",
    proposedIntentContainer: "BUG",
    proposedProductFamily: "Short-KUT",
    proposedBugEligible: true,
    proposedUnitPriceCents: 199,
    proposedMaxRepeatCount: 5,
    proposedRepeatRequiresSchedule: true,
    proposedUncontrolledRandomDeliveryAllowed: false,
    proposedSurpriseWindowAllowedOnlyWhenExplicit: true,
    bugLane: laneFor(file),
    sourceAudioFile: file,
    sourceAudioUrl: "/" + file.replace(/^public\//, ""),
    durationSeconds: dur,
    sizeBytes: size,
    reason: tinyByDuration
      ? "duration <= 12s"
      : smallBySize
        ? "small file; duration unknown"
        : "BUG-like filename/tags; needs duration/tone review",
    forbiddenUntilApproved: true,
    notesRequiredBeforeApproval: [
      "Confirm it is a tiny Short-KUT / tiny KUT.",
      "Confirm tone is light, affectionate, non-demanding.",
      "Confirm no pressure/guilt/control/harassment.",
      "Confirm safe for repeat BUG use up to 5 only.",
      "After approval, copy/canonicalize to neutral KUT inventory if not already neutral."
    ]
  });
}

candidates.sort((a, b) => {
  const ad = a.durationSeconds ?? 999;
  const bd = b.durationSeconds ?? 999;
  return ad - bd || a.sourceAudioFile.localeCompare(b.sourceAudioFile);
});

const out = {
  version: 1,
  role: "BUG Short-KUT candidate review queue",
  generatedAt: new Date().toISOString(),
  ownsAudio: false,
  publicLaunchAllowedFromThisQueue: false,
  approvalRequired: true,
  candidateCount: candidates.length,
  launchMinimumRecommended: 15,
  targetInventoryRecommended: 30,
  candidates
};

fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
fs.writeFileSync(OUT_JSON, JSON.stringify(out, null, 2) + "\n");

let md = `# BUG Short-KUT Candidate Review Queue\n\n`;
md += `Generated: ${out.generatedAt}\n\n`;
md += `Candidate count: ${candidates.length}\n\n`;
md += `These are **not approved BUGs**. Human review is required before any item enters the BUG-eligible index.\n\n`;
for (const [i, c] of candidates.entries()) {
  md += `## ${i + 1}. ${c.bugLane}\n\n`;
  md += `- File: \`${c.sourceAudioFile}\`\n`;
  md += `- Duration: ${c.durationSeconds ?? "unknown"}\n`;
  md += `- Reason: ${c.reason}\n`;
  md += `- Status: ${c.reviewStatus}\n\n`;
}
fs.writeFileSync(OUT_MD, md);

console.log("BUG SHORT-KUT CANDIDATE REVIEW QUEUE BUILT");
console.log(`Candidates: ${candidates.length}`);
console.log(OUT_JSON);
console.log(OUT_MD);
console.log("");
console.log("TOP 40:");
for (const c of candidates.slice(0, 40)) {
  console.log(`${c.durationSeconds ?? "?"}s | ${c.bugLane} | ${c.sourceAudioFile}`);
}
