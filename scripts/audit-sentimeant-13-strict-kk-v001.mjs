import crypto from "node:crypto";
import fs from "node:fs";

function stop(message) {
  throw new Error(message);
}

function sha256(path) {
  return crypto.createHash("sha256").update(fs.readFileSync(path)).digest("hex");
}

try {
  const manifest = JSON.parse(fs.readFileSync("data/sentimeant/strict-kk-pool-v001.json", "utf8"));
  const review = JSON.parse(fs.readFileSync("data/sentimeant/semantic-match-review-v001.json", "utf8"));
  const lock = JSON.parse(fs.readFileSync("config/strict-music-emergency-hold.v1.json", "utf8"));
  const home = fs.readFileSync("app/_sentimeant-home.tsx", "utf8");
  const storyRoute = fs.readFileSync("app/sentimeant/[slug]/page.tsx", "utf8");
  const middleware = fs.readFileSync("middleware.ts", "utf8");

  if (manifest.schema_version !== "SENTIMEANT_13_STRICT_KK_V001") {
    stop("incident manifest schema drift");
  }
  if (!Array.isArray(manifest.rows) || manifest.rows.length !== 13) {
    stop("all 13 incident rows must remain preserved");
  }

  if (review.schema_version !== "SENTIMEANT_SEMANTIC_MATCH_REVIEW_V001") {
    stop("semantic review schema drift");
  }
  if (review.status !== "UNMATCHED_HOLD") {
    stop("semantic review must remain held");
  }
  if (review.automatic_assignment_allowed !== false) {
    stop("automatic semantic assignment must remain forbidden");
  }
  if (review.positional_zip_assignment_allowed !== false) {
    stop("positional zip assignment must remain forbidden");
  }
  if (review.approved_theme_count !== 0 || review.required_approved_theme_count !== 13) {
    stop("semantic approval counts are inaccurate");
  }
  if (!Array.isArray(review.rows) || review.rows.length !== 13) {
    stop("semantic review must contain exactly 13 themes");
  }

  for (const row of review.rows) {
    if (row.status !== "UNMATCHED_HOLD") {
      stop(`${row.theme_id}: theme advanced without review`);
    }
    if (row.GD_individual_review_decision !== null) {
      stop(`${row.theme_id}: unrecorded GD decision represented as complete`);
    }
    for (const field of [
      "dressed_LT_PIX_SSOT_identity",
      "canonical_song_title",
      "dressed_KK_id",
      "DISCO_lyric_evidence",
      "meaning_match_status",
      "mood_match_status",
      "feeling_match_status",
      "sentiment_match_status",
      "relationship_POV_match_status",
      "occasion_use_case_match_status",
      "audio_presentation_match_status",
      "duplicate_underlying_song_check",
    ]) {
      if (row[field] !== null) {
        stop(`${row.theme_id}: ${field} changed before controlled review`);
      }
    }
  }

  const evidence = lock.temporary_curated_release || {};
  if (evidence.status !== "ISOLATED_AS_SEMANTIC_MISMATCH_EVIDENCE") {
    stop("semantic mismatch evidence isolation status missing");
  }
  if (evidence.evidence_files_preserved !== true) {
    stop("evidence files are not declared preserved");
  }
  if (evidence.public_story_access !== false || evidence.public_audio_access !== false) {
    stop("evidence must not be public");
  }
  if (evidence.GD_reviews_required !== 13 || evidence.GD_reviews_completed !== 0) {
    stop("individual theme review status is inaccurate");
  }

  const deliveryShas = new Set();
  const sourceShas = new Set();

  for (const row of manifest.rows) {
    if (row.temporary_selection_rule !== "Temporary strict-music KK; no unsupported claim that the KK text semantically matches the story.") {
      stop(`${row.slug}: original semantic-disclaimer evidence changed`);
    }
    if (!/^[0-9a-f]{64}$/u.test(row.source_audio_sha256)) {
      stop(`${row.slug}: source SHA evidence invalid`);
    }
    if (!/^[0-9a-f]{64}$/u.test(row.delivery_audio_sha256)) {
      stop(`${row.slug}: delivery SHA evidence invalid`);
    }

    const file = `public${row.delivery_audio_url}`;
    if (!fs.existsSync(file)) {
      stop(`${row.slug}: evidence MP3 missing`);
    }
    if (sha256(file) !== row.delivery_audio_sha256) {
      stop(`${row.slug}: evidence MP3 SHA changed`);
    }

    sourceShas.add(row.source_audio_sha256);
    deliveryShas.add(row.delivery_audio_sha256);
  }

  if (sourceShas.size !== 13 || deliveryShas.size !== 13) {
    stop("all 13 distinct source and delivery SHA records must remain preserved");
  }

  if (!home.includes("Semantic match hold") || !home.includes("Public story audio: 0")) {
    stop("Sentimeant public hold copy missing");
  }
  if (home.includes("<CuteHugCarousel") || home.includes("Live now · 13 strict-music-proven KKs")) {
    stop("unsupported 13-story release remains public");
  }
  if (storyRoute.includes("<audio") || storyRoute.includes("story.audioUrl")) {
    stop("direct story audio remains exposed");
  }
  if (!storyRoute.includes("Audio blocked")) {
    stop("direct story hold copy missing");
  }

  for (const required of [
    'SENTIMEANT_EVIDENCE_AUDIO_PREFIX = "/sentimeant/strict-kk-v001/"',
    "status: 410",
    '"X-Sentimeant-Semantic-Hold": "active"',
    '"/sentimeant/:path*"',
  ]) {
    if (!middleware.includes(required)) {
      stop(`middleware evidence block missing ${required}`);
    }
  }

  console.log("SENTIMEANT 13 SEMANTIC-MISMATCH EVIDENCE AUDIT PASS");
  console.log("EVIDENCE ROWS PRESERVED: 13");
  console.log("EVIDENCE MP3S PRESERVED: 13");
  console.log("PUBLIC STORY AUDIO: 0");
  console.log("DIRECT EVIDENCE AUDIO ACCESS: 410 GONE");
  console.log("SEMANTIC MATCHES APPROVED: 0 OF 13");
  console.log("AUTOMATIC / POSITIONAL ASSIGNMENT: FORBIDDEN");
  console.log("REBUILD AUTHORITY: DRESSED LT-PIX/KK FIRST");
} catch (error) {
  console.error("SENTIMEANT 13 SEMANTIC-MISMATCH EVIDENCE AUDIT FAIL");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
