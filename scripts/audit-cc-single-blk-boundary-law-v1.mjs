import fs from "node:fs";
import { prosecuteSingleBlkCc } from "./lib/cc-single-blk-boundary-law.mjs";

function fail(message) {
  throw new Error(`CC SINGLE-BLK LAW AUDIT FAIL: ${message}`);
}
const base = {
  start: 10,
  end: 12,
  lines: [
    { text: "one", start: 10, end: 11, blk_id: "BLK-1", blk_start_seconds: 9, blk_end_seconds: 13 },
    { text: "two", start: 11, end: 12, blk_id: "BLK-1", blk_start_seconds: 9, blk_end_seconds: 13 },
  ],
};
if (prosecuteSingleBlkCc(base, { requireRenderedEndpoint: false }).passed !== true) fail("valid single-BLK metadata rejected");
if (prosecuteSingleBlkCc({ ...base, end: 14 }, { requireRenderedEndpoint: false }).passed) fail("CC ending after BLK passed");
const cross = structuredClone(base);
cross.lines[1].blk_id = "BLK-2";
if (prosecuteSingleBlkCc(cross, { requireRenderedEndpoint: false }).passed) fail("cross-BLK CC passed");
const missing = structuredClone(base);
delete missing.lines[0].blk_id;
if (prosecuteSingleBlkCc(missing, { requireRenderedEndpoint: false }).passed) fail("missing blk_id passed");

const measuredTwoSeconds = () => ({
  path: "package.json",
  measured_duration_seconds: 2,
  sha256: "synthetic-build-audit",
});
if (!prosecuteSingleBlkCc(
  { ...base, rendered_audio_path: "package.json" },
  { probeRenderedEndpoint: measuredTwoSeconds },
).passed) fail("measured two-second render rejected");
if (prosecuteSingleBlkCc(
  { ...base, end: 11, rendered_audio_path: "package.json" },
  { probeRenderedEndpoint: measuredTwoSeconds },
).passed) fail("render extending past CC endpoint passed");

const promoterSource = fs.readFileSync("scripts/promote-line-cc-ready-inventory.mjs", "utf8");
const packageSource = fs.readFileSync("package.json", "utf8");
if (!promoterSource.includes("prosecuteSingleBlkCc(candidate, { requireRenderedEndpoint: true })")) fail("promotion gate does not require rendered endpoint prosecution");
if (!promoterSource.includes('status: "HOLD_UNVERIFIED_BOUNDARY"')) fail("promotion gate does not fail closed to boundary hold");
if (!packageSource.includes("npm run audit:cc-single-blk-boundary")) fail("prebuild does not invoke CC boundary audit");
console.log("CC SINGLE-BLK + RENDERED ENDPOINT LAW: PASS");
console.log("RULE: CC.start >= BLK.start");
console.log("RULE: CC.end <= BLK.end");
console.log("RULE: exactly one nonempty blk_id");
console.log("RULE: ffprobe-measured render duration must match CC source duration");
