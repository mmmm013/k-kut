import fs from "node:fs";
import path from "node:path";

const BUG_SHORTLIST = "data/kut-inventory/review/bug-short-kut-review-shortlist.json";

const OUT_BUG_JSON = "data/kut-inventory/review/bug-human-review-playable-shortlist.json";
const OUT_BUG_MD = "data/kut-inventory/review/bug-human-review-playable-shortlist.md";

const OUT_STI_JSON = "data/stis/review/sti-bti-system-review-queue.json";
const OUT_STI_MD = "data/stis/review/sti-bti-system-review-queue.md";

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function isSystemSti(file) {
  const s = String(file || "").toLowerCase();
  return (
    s.includes("/_system/") ||
    s.includes("/audio-system/") ||
    s.includes("lead-padding") ||
    s.includes("tail-padding") ||
    s.includes("padding") ||
    s.includes("twinkle") ||
    /(^|[-_/])dp([-_/]|$)/i.test(s) ||
    s.includes("delivered-present") ||
    s.includes("delivery-present")
  );
}

function stiKind(file) {
  const s = String(file || "").toLowerCase();
  if (s.includes("padding")) return "PADDING";
  if (s.includes("twinkle")) return "TWINKLE";
  if (/(^|[-_/])dp([-_/]|$)/i.test(s) || s.includes("delivered-present") || s.includes("delivery-present")) return "DP";
  if (s.includes("/_system/") || s.includes("/audio-system/")) return "SYSTEM_AUDIO";
  return "SYSTEM_STI";
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  let out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (["node_modules", ".next", ".git"].includes(ent.name)) continue;
      out = out.concat(walk(p));
    } else {
      out.push(p);
    }
  }
  return out;
}

const audioExt = new Set([".mp3", ".m4a", ".wav", ".aac"]);
const raw = fs.existsSync(BUG_SHORTLIST) ? readJson(BUG_SHORTLIST) : { shortlist: [] };
const shortlist = raw.shortlist || raw.candidates || [];

const bugPlayable = [];
const stiFromBugShortlist = [];

for (const item of shortlist) {
  const file = item.sourceAudioFile || "";
  if (isSystemSti(file)) {
    stiFromBugShortlist.push({
      stiReviewStatus: "needs-STI-BTI-review",
      source: "BUG shortlist reroute",
      stiKind: stiKind(file),
      sourceAudioFile: file,
      sourceAudioUrl: item.sourceAudioUrl,
      durationSeconds: item.durationSeconds ?? null,
      reason: "Required/system-support item; not eligible for BUG approval until STI-Slot + BTI + BF + Release Gate.",
      requiredNextSteps: [
        "Confirm required system role.",
        "Assign STI identity.",
        "Assign STI-Slot.",
        "Define BTI: brand role, behavior role, naming, display, promise, limits.",
        "Define BF blocks.",
        "Assign outlet/release gate.",
        "Only then allow support use in K-KUT/HUG/TUG/BUG flows."
      ]
    });
  } else {
    bugPlayable.push({
      bugHumanReviewNumber: bugPlayable.length + 1,
      reviewStatus: "needs-human-audio-review",
      approvalDecision: "pending",
      approvedForBugIndex: false,
      proposedIntentContainer: "BUG",
      proposedProductFamily: "Short-KUT",
      proposedUnitPriceCents: 199,
      proposedMaxRepeatCount: 5,
      proposedRepeatRequiresSchedule: true,
      proposedUncontrolledRandomDeliveryAllowed: false,
      proposedSurpriseWindowAllowedOnlyWhenExplicit: true,
      bugLane: item.bugLane || "GENERAL_LIGHT_NUDGE",
      sourceAudioFile: file,
      sourceAudioUrl: item.sourceAudioUrl,
      durationSeconds: item.durationSeconds ?? null,
      reviewChecklist: [
        "Listen to full clip.",
        "Confirm actual musical/audio value, not silence/padding/twinkle/system prompt.",
        "Confirm tiny Short-KUT fit.",
        "Confirm BUG-safe tone: light, brief, affectionate, non-demanding.",
        "Confirm no pressure, guilt, control, harassment, grief, serious repair, or coercion.",
        "Confirm usable as 1–5 scheduled/event-based BUGs.",
        "Approve or reject."
      ]
    });
  }
}

// Also scan all public audio for STI urgent items: Padding / Twinkle / DP.
const publicFiles = walk("public")
  .filter((p) => audioExt.has(path.extname(p).toLowerCase()))
  .filter(isSystemSti);

const seenSti = new Set(stiFromBugShortlist.map(x => x.sourceAudioFile));
const stiAll = [...stiFromBugShortlist];

for (const file of publicFiles) {
  if (seenSti.has(file)) continue;
  seenSti.add(file);
  stiAll.push({
    stiReviewStatus: "needs-STI-BTI-review",
    source: "public audio STI scan",
    stiKind: stiKind(file),
    sourceAudioFile: file,
    sourceAudioUrl: "/" + file.replace(/^public\//, ""),
    reason: "System-support audio appears to be a required STI candidate.",
    requiredNextSteps: [
      "Confirm required system role.",
      "Assign STI identity.",
      "Assign STI-Slot.",
      "Define BTI.",
      "Define BF blocks.",
      "Assign outlet/release gate."
    ]
  });
}

const bugOut = {
  version: 1,
  role: "BUG human review playable shortlist",
  generatedAt: new Date().toISOString(),
  sourceShortlist: BUG_SHORTLIST,
  ownsAudio: false,
  publicLaunchAllowedFromThisQueue: false,
  approvalRequired: true,
  bugReviewCount: bugPlayable.length,
  items: bugPlayable
};

const stiOut = {
  version: 1,
  role: "STI / BTI system review queue",
  generatedAt: new Date().toISOString(),
  ownsAudio: false,
  publicLaunchAllowedFromThisQueue: false,
  approvalRequired: true,
  stiReviewCount: stiAll.length,
  items: stiAll
};

fs.mkdirSync(path.dirname(OUT_BUG_JSON), { recursive: true });
fs.mkdirSync(path.dirname(OUT_STI_JSON), { recursive: true });

fs.writeFileSync(OUT_BUG_JSON, JSON.stringify(bugOut, null, 2) + "\n");
fs.writeFileSync(OUT_STI_JSON, JSON.stringify(stiOut, null, 2) + "\n");

let bugMd = "# BUG Human Review Playable Shortlist\n\n";
bugMd += `Count: ${bugPlayable.length}\n\n`;
bugMd += "These are not approved BUGs yet. Review one by one.\n\n";
for (const item of bugPlayable) {
  bugMd += `## ${item.bugHumanReviewNumber}. ${item.bugLane}\n\n`;
  bugMd += `- File: \`${item.sourceAudioFile}\`\n`;
  bugMd += `- URL: \`${item.sourceAudioUrl}\`\n`;
  bugMd += `- Duration: ${item.durationSeconds ?? "unknown"}\n`;
  bugMd += `- Decision: pending\n`;
  bugMd += `- Approve for BUG index: no\n\n`;
}
fs.writeFileSync(OUT_BUG_MD, bugMd.trimEnd() + "\n");

let stiMd = "# STI / BTI System Review Queue\n\n";
stiMd += `Count: ${stiAll.length}\n\n`;
stiMd += "Padding, Twinkle, DP, and other system-support audio are routed here for STI-Slot + BTI + BF review. They are not BUG products by default.\n\n";
for (const [i, item] of stiAll.entries()) {
  stiMd += `## ${i + 1}. ${item.stiKind}\n\n`;
  stiMd += `- File: \`${item.sourceAudioFile}\`\n`;
  stiMd += `- URL: \`${item.sourceAudioUrl}\`\n`;
  stiMd += `- Status: ${item.stiReviewStatus}\n`;
  stiMd += `- Reason: ${item.reason}\n\n`;
}
fs.writeFileSync(OUT_STI_MD, stiMd.trimEnd() + "\n");

console.log("STI / BTI + BUG REVIEW ROUTING COMPLETE");
console.log(`BUG playable review count: ${bugPlayable.length}`);
console.log(`STI/BTI system review count: ${stiAll.length}`);
console.log(OUT_BUG_JSON);
console.log(OUT_BUG_MD);
console.log(OUT_STI_JSON);
console.log(OUT_STI_MD);

console.log("");
console.log("BUG REVIEW START:");
for (const item of bugPlayable.slice(0, 22)) {
  console.log(`${item.bugHumanReviewNumber}. ${item.bugLane} | ${item.sourceAudioFile}`);
}
