import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const orderPath = "manifests/kkr/dispatch/thank-you-kk8-bridge-br-materialization.json";
const sourceAudio = "public/mothers-day/thank-you/song/thank-you-song.mp3";
const reviewDir = "ops/review/kkr/br-section-review";
const finalAudio = "public/mothers-day/thank-you/kks-expanded/thank-you-sec-br.mp3";

if (!fs.existsSync(orderPath)) {
  console.error(`STOP: missing order ${orderPath}`);
  process.exit(1);
}

if (!fs.existsSync(sourceAudio)) {
  console.error(`STOP: missing source audio ${sourceAudio}`);
  process.exit(1);
}

fs.mkdirSync(reviewDir, { recursive: true });

const candidates = [
  {
    id: "kk8-br-candidate-a",
    label: "KK8 Bridge / Br candidate A",
    start: 206,
    end: 228,
    out: `${reviewDir}/kk8-br-candidate-a.mp3`
  },
  {
    id: "kk8-br-candidate-b",
    label: "KK8 Bridge / Br candidate B",
    start: 204,
    end: 228,
    out: `${reviewDir}/kk8-br-candidate-b.mp3`
  },
  {
    id: "kk8-br-candidate-c",
    label: "KK8 Bridge / Br candidate C",
    start: 208,
    end: 228,
    out: `${reviewDir}/kk8-br-candidate-c.mp3`
  }
];

for (const c of candidates) {
  execFileSync("ffmpeg", [
    "-y",
    "-i", sourceAudio,
    "-ss", String(c.start),
    "-to", String(c.end),
    "-c:a", "libmp3lame",
    "-q:a", "2",
    c.out
  ], { stdio: "inherit" });
}

const report = {
  status: "OWNER_REVIEW_REQUIRED",
  pix: "Thank You",
  legacy_structure_id: "KK8",
  legacy_title: "Bridge",
  canonical_structure: "Br",
  final_required_delivery_audio: finalAudio,
  instruction: "Listen to candidates. The approved candidate must contain only KK8 / Bridge / Br, then copy it to final delivery path.",
  lyric_structure: [
    "Oh, we've been through valleys",
    "We've scaled mountains",
    "And we've had fun",
    "Along the way",
    "But at the end of the day",
    "Your love will always remain"
  ],
  candidates: candidates.map(c => ({
    id: c.id,
    label: c.label,
    review_audio: c.out,
    approve_command: `cp ${c.out} ${finalAudio}`
  })),
  doctrine: [
    "Bridge and Br are aliases.",
    "Canonical delivery label is Br.",
    "This is controlled generation for KK8 only.",
    "Review/proof audio must use private ops paths, not public, holiday, promo, or customer-facing paths.",
    "Time here is locator metadata for rendering audio, not KK qualification.",
    "No CC, mK, micro, Sandman, magic-tail, or generic sample fallback."
  ]
};

fs.writeFileSync(`${reviewDir}/kk8-br-review-report.json`, JSON.stringify(report, null, 2) + "\n");

console.log("KK8 / Bridge / Br controlled review pack created.");
console.log(`Review folder: ${reviewDir}`);
console.log("");
for (const c of candidates) {
  console.log(`${c.id}: ${c.out}`);
}
console.log("");
console.log("After listening, approve one with:");
console.log(`cp ${reviewDir}/kk8-br-candidate-a.mp3 ${finalAudio}`);
console.log("or candidate-b / candidate-c if better.");
