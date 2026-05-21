import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const manifestPath = "manifests/wedding/forever-and-a-day-wedding-kut-section-map.draft.json";
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

const source = manifest.source_local_path;
const outDir = "incoming/wedding-forever-and-a-day/kuts-finishing-review";

if (!fs.existsSync(source)) {
  console.error(`Missing source file: ${source}`);
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });

const totalDuration = Number(manifest.duration_sec ?? 324.3);
const frontPadding = Number(manifest.processing_rule?.front_padding_sec ?? 2.5);
const backPadding = Number(manifest.processing_rule?.back_padding_sec ?? 5.0);
const fadeIn = Number(manifest.processing_rule?.fade_in_sec ?? 0.3);
const fadeOut = Number(manifest.processing_rule?.fade_out_sec ?? 2.5);

const reviewRows = [];

function safeFileName(value) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

for (const kut of manifest.kuts) {
  const rawStart = Number(kut.start_sec);
  const rawEnd = Number(kut.end_sec);

  if (!Number.isFinite(rawStart) || !Number.isFinite(rawEnd) || rawEnd <= rawStart) {
    console.error(`Bad timing for ${kut.id}: ${rawStart} -> ${rawEnd}`);
    process.exit(1);
  }

  const paddedStart = Math.max(0, rawStart - frontPadding);
  const paddedEnd = Math.min(totalDuration, rawEnd + backPadding);
  const duration = paddedEnd - paddedStart;
  const fadeOutStart = Math.max(0, duration - fadeOut);
  const publicTitle = kut.public_title ?? kut.title ?? kut.id;
  const outName = `${safeFileName(kut.id)}--${safeFileName(publicTitle)}.mp3`;
  const out = path.join(outDir, outName);

  console.log(`FINISHING CUT ${kut.id}`);
  console.log(`  raw:    ${rawStart}s -> ${rawEnd}s`);
  console.log(`  padded: ${paddedStart}s -> ${paddedEnd}s (${duration}s)`);
  console.log(`  title:  ${publicTitle}`);

  const result = spawnSync("ffmpeg", [
    "-y",
    "-ss", String(paddedStart),
    "-t", String(duration),
    "-i", source,
    "-vn",
    "-af", `afade=t=in:st=0:d=${fadeIn},afade=t=out:st=${fadeOutStart}:d=${fadeOut}`,
    "-metadata", `title=${publicTitle}`,
    "-metadata", "artist=KLEIGH",
    "-metadata", "album=Forever & A Day Wedding KUTs - Review",
    "-metadata", `comment=Draft finishing-review KUT. ${manifest.warning}`,
    "-codec:a", "libmp3lame",
    "-b:a", "192k",
    out
  ], { stdio: "inherit" });

  if (result.status !== 0) {
    console.error(`Failed cutting ${kut.id}`);
    process.exit(result.status ?? 1);
  }

  reviewRows.push({
    id: kut.id,
    public_title: publicTitle,
    buyer_intent: kut.buyer_intent ?? "",
    raw_start_sec: rawStart,
    raw_end_sec: rawEnd,
    padded_start_sec: Number(paddedStart.toFixed(3)),
    padded_end_sec: Number(paddedEnd.toFixed(3)),
    output_file: out,
    status: kut.status ?? "phrase_complete_review_required",
    review_note: kut.review_note ?? "",
    review_checklist: manifest.review_checklist ?? [],
  });
}

const reviewManifestPath = path.join(outDir, "review-manifest.json");
fs.writeFileSync(reviewManifestPath, JSON.stringify({
  source_pix: manifest.source_pix,
  finishing_standard: manifest.finishing_standard,
  twinkle_mode: manifest.processing_rule?.twinkle_mode ?? "page_twinkle_only",
  audio_twinkle_status: manifest.processing_rule?.audio_twinkle_status ?? "not_approved",
  warning: "Do not upload, seed, or sell these cuts until human listening review approves them.",
  cuts: reviewRows,
}, null, 2) + "\n");

console.log("Done. Finishing-review Wedding KUT cuts written to:", outDir);
console.log("Review manifest:", reviewManifestPath);
