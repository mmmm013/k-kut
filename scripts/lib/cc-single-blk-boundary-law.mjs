import fs from "node:fs";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";

const EPSILON_SECONDS = 0.001;
const RENDER_TOLERANCE_SECONDS = 0.05;

function finite(value) {
  return Number.isFinite(Number(value));
}

function unique(values) {
  return [...new Set(values)];
}

export function prosecuteSingleBlkCc(candidate, options = {}) {
  const reasons = [];
  const lines = Array.isArray(candidate?.lines) ? candidate.lines : [];
  const blkIds = unique(lines.map((line) => String(line?.blk_id || "").trim()));
  const nonemptyBlkIds = blkIds.filter(Boolean);

  if (lines.length < 1) reasons.push("missing_lines");
  if (blkIds.some((id) => !id)) reasons.push("missing_blk_id");
  if (nonemptyBlkIds.length !== 1 || blkIds.length !== 1) reasons.push("cross_blk_or_unresolved_blk_id");

  const blkStarts = unique(lines.map((line) => Number(line?.blk_start_seconds)).filter(Number.isFinite));
  const blkEnds = unique(lines.map((line) => Number(line?.blk_end_seconds)).filter(Number.isFinite));
  if (blkStarts.length !== 1) reasons.push("missing_or_conflicting_blk_start");
  if (blkEnds.length !== 1) reasons.push("missing_or_conflicting_blk_end");

  const ccStart = Number(candidate?.start);
  const ccEnd = Number(candidate?.end);
  const blkStart = blkStarts[0];
  const blkEnd = blkEnds[0];

  if (!finite(ccStart) || !finite(ccEnd) || ccEnd <= ccStart) reasons.push("invalid_cc_boundary");
  if (finite(ccStart) && finite(blkStart) && ccStart + EPSILON_SECONDS < blkStart) {
    reasons.push("cc_starts_before_blk");
  }
  if (finite(ccEnd) && finite(blkEnd) && ccEnd - EPSILON_SECONDS > blkEnd) {
    reasons.push("cc_ends_after_blk");
  }

  const requireRenderedEndpoint = options.requireRenderedEndpoint !== false;
  let rendered = null;
  if (requireRenderedEndpoint) {
    const renderedPath = String(candidate?.rendered_audio_path || "").trim();
    const expectedDuration = finite(ccStart) && finite(ccEnd) ? ccEnd - ccStart : null;
    if (!renderedPath || !fs.existsSync(renderedPath)) {
      reasons.push("rendered_audio_missing");
    } else if (!expectedDuration) {
      reasons.push("rendered_duration_unverifiable");
    } else {
      try {
        const measuredDuration = Number(execFileSync("ffprobe", [
          "-v", "error",
          "-show_entries", "format=duration",
          "-of", "default=noprint_wrappers=1:nokey=1",
          renderedPath,
        ], { encoding: "utf8" }).trim());
        const sha256 = createHash("sha256").update(fs.readFileSync(renderedPath)).digest("hex");
        rendered = { path: renderedPath, measured_duration_seconds: measuredDuration, sha256 };
        if (!Number.isFinite(measuredDuration)) reasons.push("rendered_duration_unverifiable");
        else if (Math.abs(measuredDuration - expectedDuration) > RENDER_TOLERANCE_SECONDS) {
          reasons.push("rendered_endpoint_duration_mismatch");
        }
      } catch {
        reasons.push("rendered_endpoint_probe_failed");
      }
    }
  }

  return {
    passed: reasons.length === 0,
    status: reasons.length === 0 ? "READY_FOR_CC" : "HOLD_UNVERIFIED_BOUNDARY",
    reasons,
    blk_id: nonemptyBlkIds.length === 1 ? nonemptyBlkIds[0] : null,
    blk_start_seconds: blkStarts.length === 1 ? blkStart : null,
    blk_end_seconds: blkEnds.length === 1 ? blkEnd : null,
    cc_start_seconds: finite(ccStart) ? ccStart : null,
    cc_end_seconds: finite(ccEnd) ? ccEnd : null,
    rendered_endpoint: rendered,
  };
}
