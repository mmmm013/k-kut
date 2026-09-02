import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";

const SAMPLE_RATE = 8_000;
const FRAME_MS = 20;
const HOP_MS = 10;
const SEARCH_BEFORE_SEC = 1.25;
const SEARCH_AFTER_SEC = 0.35;
const LOW_RATIO = 0.70;
const STRONG_VOCAL_RATIO = 0.78;
const MIN_SEPARATOR_SEC = 0.05;
const AUTHORITY_KIND = "CAPTURED_CC_AUTHORITY_ONLY";

function fail(message) {
  throw new Error(`CAPTURED-CC ENDPOINT PROSECUTOR: ${message}`);
}

function sha256(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}

function finite(value, label) {
  const number = Number(value);
  if (!Number.isFinite(number)) fail(`${label} must be finite`);
  return number;
}

function decodeMono(file) {
  const bytes = execFileSync("ffmpeg", [
    "-hide_banner", "-loglevel", "error", "-i", file,
    "-vn", "-ac", "1", "-ar", String(SAMPLE_RATE), "-f", "f32le", "pipe:1",
  ], { maxBuffer: 128 * 1024 * 1024 });
  return new Float32Array(bytes.buffer, bytes.byteOffset, Math.floor(bytes.byteLength / 4));
}

function calibrateAlignment(vocal, instrumental, lockedLagSec) {
  const expected = Math.round(lockedLagSec * SAMPLE_RATE);
  const radius = Math.round(0.02 * SAMPLE_RATE);
  const margin = SAMPLE_RATE * 5;
  let best = null;

  for (let shift = expected - radius; shift <= expected + radius; shift += 1) {
    let xy = 0;
    let xx = 0;
    let yy = 0;
    let count = 0;
    const last = Math.min(vocal.length, instrumental.length) - margin;
    for (let sample = margin; sample < last; sample += 16) {
      const instrumentalSample = instrumental[sample - shift];
      if (instrumentalSample === undefined) continue;
      const vocalSample = vocal[sample];
      xy += instrumentalSample * vocalSample;
      xx += instrumentalSample * instrumentalSample;
      yy += vocalSample * vocalSample;
      count += 1;
    }
    const scale = xy / xx;
    const mse = (yy - 2 * scale * xy + scale * scale * xx) / count;
    const correlation = xy / Math.sqrt(xx * yy);
    if (!best || mse < best.mse) best = { shift, scale, mse, correlation };
  }

  if (!best) fail("could not align vocal and instrumental masters");
  return {
    lag_sec: best.shift / SAMPLE_RATE,
    instrumental_scale: best.scale,
    residual_mse: best.mse,
    correlation: best.correlation,
  };
}

function buildFrames(vocal, instrumental, alignment) {
  const shift = Math.round(alignment.lag_sec * SAMPLE_RATE);
  const frameSize = Math.round((FRAME_MS / 1_000) * SAMPLE_RATE);
  const hopSize = Math.round((HOP_MS / 1_000) * SAMPLE_RATE);
  const last = Math.min(vocal.length, instrumental.length + shift) - frameSize;
  const frames = [];

  for (let from = Math.max(0, shift); from <= last; from += hopSize) {
    let residualSquare = 0;
    let vocalSquare = 0;
    for (let offset = 0; offset < frameSize; offset += 1) {
      const y = vocal[from + offset];
      const x = instrumental[from + offset - shift] ?? 0;
      const residual = y - alignment.instrumental_scale * x;
      residualSquare += residual * residual;
      vocalSquare += y * y;
    }
    const residualRms = Math.sqrt(residualSquare / frameSize);
    const vocalRms = Math.sqrt(vocalSquare / frameSize);
    frames.push({
      time: (from + frameSize / 2) / SAMPLE_RATE,
      residual_ratio: residualRms / Math.max(vocalRms, 1e-9),
      residual_dbfs: 20 * Math.log10(Math.max(residualRms, 1e-9)),
    });
  }
  return frames;
}

function median(values) {
  if (!values.length) return 0;
  const ordered = [...values].sort((a, b) => a - b);
  return ordered[Math.floor(ordered.length / 2)];
}

function frameWindow(frames, start, end) {
  return frames.filter((frame) => frame.time >= start && frame.time <= end);
}

function prosecuteEndpoint(frames, storedEnd, lockedEnds) {
  const locked = lockedEnds.find((value) => Math.abs(value - storedEnd) < 0.001);
  if (locked !== undefined) {
    return {
      proposed_end_sec: locked,
      prosecution_state: "LOCKED_KKR_REFERENCE_PASS",
      confidence: 1,
      evidence: {
        authority: "OWNER_LOCKED_SCRIPT_AUDITED_KKR_BOUNDARY_TRUTH",
        separator_duration_sec: null,
        pre_vocal_ratio: null,
        separator_ratio: null,
        post_vocal_ratio: null,
      },
    };
  }

  const local = frameWindow(frames, storedEnd - SEARCH_BEFORE_SEC, storedEnd + SEARCH_AFTER_SEC);
  if (local.length < 5) fail(`not enough audio evidence around ${storedEnd}`);
  const candidates = [];
  let runStart = null;

  for (let index = 0; index <= local.length; index += 1) {
    const low = index < local.length && local[index].residual_ratio < LOW_RATIO;
    if (low && runStart === null) runStart = index;
    if ((!low || index === local.length) && runStart !== null) {
      const runEnd = index - 1;
      const before = local.slice(Math.max(0, runStart - 12), runStart);
      const run = local.slice(runStart, runEnd + 1);
      const after = local.slice(runEnd + 1, Math.min(local.length, runEnd + 13));
      const duration = run.length * (HOP_MS / 1_000);
      const preRatio = median(before.map((frame) => frame.residual_ratio));
      const separatorRatio = median(run.map((frame) => frame.residual_ratio));
      const postRatio = median(after.map((frame) => frame.residual_ratio));
      const beginsBeforeStoredEnd = run[0].time <= storedEnd + 0.08;
      const distance = Math.abs(run[0].time - storedEnd);
      if (duration >= MIN_SEPARATOR_SEC && beginsBeforeStoredEnd && preRatio >= STRONG_VOCAL_RATIO) {
        const separationDepth = Math.max(0, preRatio - separatorRatio);
        const returnsToVocal = postRatio >= STRONG_VOCAL_RATIO;
        const confidence = Math.min(0.99,
          0.45 +
          Math.min(0.22, duration * 1.3) +
          Math.min(0.22, separationDepth * 0.8) +
          (returnsToVocal ? 0.08 : 0) -
          Math.min(0.15, Math.max(0, distance - 0.45) * 0.2)
        );
        candidates.push({
          proposed_end_sec: Number(Math.max(0, run[0].time - FRAME_MS / 2_000).toFixed(3)),
          prosecution_state: confidence >= 0.78 ? "KKR_SCIENTIFIC_BATCH_PASS" : "KKR_EXCEPTION_REVIEW",
          confidence: Number(confidence.toFixed(3)),
          distance,
          evidence: {
            authority: "ALIGNED_VOCAL_INSTRUMENTAL_RESIDUAL_SEPARATOR",
            separator_duration_sec: Number(duration.toFixed(3)),
            pre_vocal_ratio: Number(preRatio.toFixed(4)),
            separator_ratio: Number(separatorRatio.toFixed(4)),
            post_vocal_ratio: Number(postRatio.toFixed(4)),
          },
        });
      }
      runStart = null;
    }
  }

  candidates.sort((a, b) => {
    const aScore = a.confidence - Math.min(0.25, a.distance * 0.08);
    const bScore = b.confidence - Math.min(0.25, b.distance * 0.08);
    return bScore - aScore;
  });
  if (candidates.length) {
    const { distance: _distance, ...candidate } = candidates[0];
    return candidate;
  }

  const minimum = [...local].sort((a, b) => a.residual_ratio - b.residual_ratio)[0];
  const preRatio = median(frameWindow(frames, minimum.time - 0.35, minimum.time - 0.08).map((frame) => frame.residual_ratio));
  const postRatio = median(frameWindow(frames, minimum.time + 0.08, minimum.time + 0.35).map((frame) => frame.residual_ratio));
  const separationDepth = Math.max(preRatio, postRatio) - minimum.residual_ratio;
  const distance = Math.abs(minimum.time - storedEnd);
  const confidence = Math.max(0, Math.min(0.92,
    0.5 + Math.min(0.3, separationDepth * 0.75) - Math.min(0.18, Math.max(0, distance - 0.5) * 0.2)
  ));
  const isPronouncedLocalSeparator =
    minimum.residual_ratio < 0.5 &&
    Math.max(preRatio, postRatio) >= STRONG_VOCAL_RATIO &&
    confidence >= 0.72;
  return {
    proposed_end_sec: Number((minimum.time - FRAME_MS / 2_000).toFixed(3)),
    prosecution_state: isPronouncedLocalSeparator ? "KKR_SCIENTIFIC_BATCH_PASS" : "KKR_EXCEPTION_REVIEW",
    confidence: Number(confidence.toFixed(3)),
    evidence: {
      authority: isPronouncedLocalSeparator ? "ALIGNED_DUAL_MASTER_PRONOUNCED_LOCAL_SEPARATOR" : "NO_HIGH_CONFIDENCE_SEPARATOR_PROVED",
      separator_duration_sec: 0,
      pre_vocal_ratio: Number(preRatio.toFixed(4)),
      separator_ratio: Number(minimum.residual_ratio.toFixed(4)),
      post_vocal_ratio: Number(postRatio.toFixed(4)),
    },
  };
}

if (spawnSync("ffmpeg", ["-version"], { stdio: "ignore" }).status !== 0) fail("ffmpeg is required");

const [worklistPath, vocalPath, instrumentalPath, outputPath = "data/kkr-captured-cc-correction-worklists/comin_true.endpoint-prosecution-v1.json"] = process.argv.slice(2);
if (!worklistPath || !vocalPath || !instrumentalPath) {
  fail("usage: node scripts/kkr/prosecute-captured-cc-endpoints-v1.mjs <worklist.json> <vocal-master> <instrumental-master> [output.json]");
}
for (const [label, file] of [["worklist", worklistPath], ["vocal master", vocalPath], ["instrumental master", instrumentalPath]]) {
  if (!fs.existsSync(file)) fail(`${label} not found: ${file}`);
}

const worklist = JSON.parse(fs.readFileSync(worklistPath, "utf8"));
const truth = JSON.parse(fs.readFileSync("data/kkr-boundary-truth/comin_true.json", "utf8"));
if (worklist.authority_source_kind !== AUTHORITY_KIND) fail("worklist is not captured-CC authority");
if (truth.kkr_biz_msc_prosecution?.owner_action_required !== false) fail("boundary truth does not assign routine prosecution to KKr");
if (!truth.lyrics?.authority_file || !fs.existsSync(truth.lyrics.authority_file)) fail("canonical full-lyric authority is missing");
const canonicalLyrics = fs.readFileSync(truth.lyrics.authority_file, "utf8").trim();
if (!canonicalLyrics || sha256(truth.lyrics.authority_file) !== truth.lyrics.sha256) fail("canonical full-lyric authority hash mismatch");
if (sha256(vocalPath) !== truth.sources.vocal.sha256 || sha256(vocalPath) !== worklist.source_sha256) fail("vocal master hash mismatch");
if (sha256(instrumentalPath) !== truth.sources.instrumental.sha256) fail("instrumental master hash mismatch");

const vocal = decodeMono(vocalPath);
const instrumental = decodeMono(instrumentalPath);
const alignment = calibrateAlignment(vocal, instrumental, truth.kkr_biz_msc_prosecution.physics_evidence.vocal_instrumental_alignment_lag_seconds);
const frames = buildFrames(vocal, instrumental, alignment);
const lockedEnds = truth.sections.map((section) => finite(section.end_sec, `${section.section_id}.end_sec`));
const endpointGroups = new Map();
for (const item of worklist.items) {
  const storedEnd = finite(item.captured_cc?.stored_capture_end_sec, `${item.work_item_id}.stored_capture_end_sec`);
  const key = storedEnd.toFixed(3);
  if (!endpointGroups.has(key)) endpointGroups.set(key, { stored_end_sec: storedEnd, work_item_ids: [], titles: [], owner_reported_defects: [] });
  const group = endpointGroups.get(key);
  group.work_item_ids.push(item.work_item_id);
  group.titles.push(...(item.display_titles || []));
  if (item.correction?.defect) group.owner_reported_defects.push({ work_item_id: item.work_item_id, defect: item.correction.defect });
}

const endpoints = [...endpointGroups.values()]
  .sort((a, b) => a.stored_end_sec - b.stored_end_sec)
  .map((group) => ({ ...group, ...prosecuteEndpoint(frames, group.stored_end_sec, lockedEnds) }));
const counts = {
  source_work_items: worklist.items.length,
  distinct_endpoints: endpoints.length,
  locked_reference_pass: endpoints.filter((item) => item.prosecution_state === "LOCKED_KKR_REFERENCE_PASS").length,
  scientific_batch_pass: endpoints.filter((item) => item.prosecution_state === "KKR_SCIENTIFIC_BATCH_PASS").length,
  exception_review: endpoints.filter((item) => item.prosecution_state === "KKR_EXCEPTION_REVIEW").length,
};

const output = {
  schema_version: "GPMX_CAPTURED_CC_ENDPOINT_PROSECUTION_V1",
  status: counts.exception_review === 0 ? "KKR_BATCH_PROSECUTION_COMPLETE" : "KKR_BATCH_PROSECUTION_EXCEPTIONS_HELD",
  generated_at: new Date().toISOString(),
  authority: {
    worklist_path: worklistPath,
    boundary_truth_path: "data/kkr-boundary-truth/comin_true.json",
    source_kind: AUTHORITY_KIND,
    owner_action_required_for_routine_prosecution: false,
    owner_correction_role: "EXCEPTION_FEEDBACK_NOT_APPROVAL_QUEUE",
    fresh_lt_pix_discovery_used: false,
    canonical_full_lyrics_read: true,
    canonical_lyric_path: truth.lyrics.authority_file,
    canonical_lyric_sha256: truth.lyrics.sha256,
    text_strategy: "PRESERVE_EXISTING_CAPTURED_CC_TEXT_AND_TITLES_NO_REAUTHORING",
  },
  source_proof: {
    vocal_sha256: sha256(vocalPath),
    instrumental_sha256: sha256(instrumentalPath),
    sample_rate_hz: SAMPLE_RATE,
  },
  method: {
    name: "ALIGNED_DUAL_MASTER_RESIDUAL_SEPARATOR_PROSECUTION",
    locked_alignment_lag_sec: truth.kkr_biz_msc_prosecution.physics_evidence.vocal_instrumental_alignment_lag_seconds,
    measured_alignment: alignment,
    frame_ms: FRAME_MS,
    hop_ms: HOP_MS,
    residual_ratio_separator_threshold: LOW_RATIO,
    strong_vocal_ratio_threshold: STRONG_VOCAL_RATIO,
    minimum_separator_sec: MIN_SEPARATOR_SEC,
    rule: "End at the first proved residual drop after the last audible vocal energy; the following gap remains separator, never tail.",
  },
  controls: {
    public_audio_authorized: false,
    purchase_authorized: false,
    materialization_authorized: false,
    post_vocal_padding_sec: 0,
    exceptions_remain_hold: true,
  },
  counts,
  endpoints,
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);
console.log("CAPTURED-CC ENDPOINT PROSECUTOR: PASS");
console.log(`ENDPOINTS=${counts.distinct_endpoints}`);
console.log(`LOCKED_REFERENCE_PASS=${counts.locked_reference_pass}`);
console.log(`SCIENTIFIC_BATCH_PASS=${counts.scientific_batch_pass}`);
console.log(`EXCEPTION_REVIEW=${counts.exception_review}`);
console.log(`OUTPUT=${outputPath}`);
