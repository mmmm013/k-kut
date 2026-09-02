import fs from "node:fs";
import crypto from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";

const manifestPath = "data/ii-delivery-registry/comin-true-full-family-v1.json";
const worklistPath = "data/kkr-captured-cc-correction-worklists/comin_true.deduplicated-v1.json";
const publicPagePath = "app/hugs/comin-true/page.tsx";
const expectedSourceSha256 = "fcf14e890b2c23c1eff1d213722332d67d282d9315c8b0e290fb2522fb092cda";
const PUBLIC_STATUS = "PUBLIC_READY_COMPLETE_FAMILY";
const HOLD_STATUS = "CAPTURED_CC_LAST_VOCAL_NOTE_END_REVIEW_HOLD";
const allowedSk = new Set(["1LNR", "HOOK", "IDIOM", "LNPR", "LNTRIO", "MTA4", "PHRZ", "TWST"]);
const allowedMk = new Set(["TRM", "VSND", "XCLM"]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
function sha256(file) {
  return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
}
function publicPath(url) {
  assert(url.startsWith("/"), `Audio URL is not root-relative: ${url}`);
  return `public${url}`;
}
function duration(file) {
  if (spawnSync("ffprobe", ["-version"], { stdio: "ignore" }).status !== 0) return null;
  return Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", file], { encoding: "utf8" }).trim());
}

assert(fs.existsSync(manifestPath), "Missing complete-family manifest");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const isPublic = manifest.status === PUBLIC_STATUS;
const isCorrectionHold = manifest.status === HOLD_STATUS;
assert(isPublic || isCorrectionHold, `Unknown family governance state: ${manifest.status}`);
assert(manifest.source_audio_unchanged === true, "Source-audio law failed");
assert(manifest.source_sha256 === expectedSourceSha256, "Recorded source hash changed");
assert(manifest.counts.hug === 15, "Expected 15 HUGs");
assert(manifest.counts.tug === 49, "Expected 49 TUGs");
assert(manifest.counts.bug === 34, "Expected 34 BUGs");
assert(manifest.counts.story_bug === 3, "Expected 3 Story BUGs");
assert(manifest.counts.total === 101, "Expected 101 total IIs");

const all = [...manifest.hugs, ...manifest.tugs, ...manifest.bugs, ...manifest.story_bugs];
assert(all.length === 101, "Manifest arrays do not contain 101 IIs");
assert(new Set(all.map((item) => item.ii_key)).size === all.length, "Duplicate II keys");

for (const item of all) {
  assert(!/\b(BLK|KK\d|sK|mK|LNPR|LNTRIO|PHRZ|TWST|MTA4)\b/i.test(item.display_title), `Internal structure leaked into display: ${item.ii_key}`);
  if (isPublic) {
    assert(item.llbp_state === "PUBLIC_PASS", `LLBP did not pass: ${item.ii_key}`);
    assert(item.boundary_prosecution_state === "STRICT_LAST_VOCAL_NOTE_END_PASS", `Exact END did not pass: ${item.ii_key}`);
    assert(item.purchase_state === "PAYMENT_LINK_PENDING_EXACT_PRICE", `Unsafe public purchase state: ${item.ii_key}`);
  } else {
    assert(item.llbp_state === "HOLD_CAPTURED_CC_END_REVIEW", `Held family leaked LLBP pass: ${item.ii_key}`);
    assert(item.boundary_prosecution_state === "HOLD", `Held family leaked boundary pass: ${item.ii_key}`);
    assert(item.purchase_state === "HOLD_CAPTURED_CC_END_REVIEW", `Held family leaked purchase eligibility: ${item.ii_key}`);
  }
}

for (const item of manifest.hugs) {
  assert(item.price_usd === "7.99", `HUG price failed: ${item.ii_key}`);
  if (isPublic) {
    const file = publicPath(item.audio_url);
    assert(fs.existsSync(file), `Missing HUG audio: ${file}`);
    assert(sha256(file) === item.sha256, `HUG hash mismatch: ${item.ii_key}`);
  }
}
for (const item of manifest.tugs) {
  assert(item.platform === "TUG" && item.kut_form === "sK", `TUG/sK identity failed: ${item.ii_key}`);
  assert(item.form_keys.length > 0 && item.form_keys.every((form) => allowedSk.has(form)), `Invalid sK form: ${item.ii_key}`);
  assert(item.price_usd === "4.99", `TUG price failed: ${item.ii_key}`);
  assert(item.source_start_sec >= 12 && item.source_end_sec <= 135.497 && item.source_end_sec > item.source_start_sec, `TUG captured interval failed: ${item.ii_key}`);
  if (isPublic) {
    const file = publicPath(item.audio_url);
    assert(fs.existsSync(file), `Missing TUG audio: ${file}`);
    assert(sha256(file) === item.sha256, `TUG hash mismatch: ${item.ii_key}`);
    const measuredDuration = duration(file);
    assert(measuredDuration === null || measuredDuration > item.rendered_clip_end_sec - item.rendered_clip_start_sec + 2, `TUG delivery framing missing: ${item.ii_key}`);
  }
}

const termVersions = new Map();
for (const item of manifest.bugs) {
  assert(item.platform === "BUG" && item.kut_form === "mK", `BUG/mK identity failed: ${item.ii_key}`);
  assert(allowedMk.has(item.form_key), `Invalid mK form: ${item.ii_key}`);
  assert(item.price_usd === "1.99", `BUG price failed: ${item.ii_key}`);
  assert(item.source_start_sec >= 12 && item.source_end_sec <= 135.497 && item.source_end_sec > item.source_start_sec, `BUG captured interval failed: ${item.ii_key}`);
  if (isPublic) {
    const file = publicPath(item.audio_url);
    assert(fs.existsSync(file), `Missing BUG audio: ${file}`);
    assert(sha256(file) === item.sha256, `BUG hash mismatch: ${item.ii_key}`);
    const measuredDuration = duration(file);
    assert(measuredDuration === null || measuredDuration > item.rendered_clip_end_sec - item.rendered_clip_start_sec + 2, `BUG delivery framing missing: ${item.ii_key}`);
  }
  const normalized = item.display_title.toLowerCase();
  termVersions.set(normalized, (termVersions.get(normalized) || 0) + 1);
}
for (const [term, count] of termVersions) assert(count <= 5, `More than five BUG versions: ${term}`);

const bugKeys = new Set(manifest.bugs.map((item) => item.ii_key));
for (const story of manifest.story_bugs) {
  assert(story.kut_form === "STORY_BUG", `Story BUG identity failed: ${story.ii_key}`);
  assert(story.price_usd === "2.98", `Story BUG price failed: ${story.ii_key}`);
  assert(story.component_bug_keys.length === 3, `Story BUG must have three components: ${story.ii_key}`);
  assert(new Set(story.component_bug_keys).size === 3, `Story BUG repeated a component: ${story.ii_key}`);
  assert(story.component_bug_keys.every((key) => bugKeys.has(key)), `Story BUG component missing: ${story.ii_key}`);
}

if (isCorrectionHold) {
  assert(fs.existsSync(worklistPath), "Correction HOLD lacks captured-CC worklist");
  const worklist = JSON.parse(fs.readFileSync(worklistPath, "utf8"));
  assert(worklist.schema_version === "GPMX_DEDUPLICATED_CAPTURED_CC_CORRECTION_WORKLIST_V1", "Wrong correction worklist schema");
  assert(worklist.status === "CORRECTION_REVIEW_REQUIRED", "HOLD requires incomplete correction-review worklist");
  assert(worklist.authority_source_kind === "CAPTURED_CC_AUTHORITY_ONLY", "Non-CC authority entered correction worklist");
  assert(worklist.discovery_search_permitted === false && worklist.fresh_lt_pix_pass_permitted === false, "Fresh discovery/search must remain forbidden");
  assert(worklist.separator_policy?.default_padding_after_last_vocal_note_sec === 0, "Post-vocal padding must be zero");
  assert(worklist.separator_policy?.gap_is_separator_not_tail === true, "Gap must remain a separator");
  assert(worklist.separator_policy?.always_distinct_between_trms === true, "Adjacent TRMs must remain distinct");
  assert(worklist.source_record_count === 98 && worklist.deduplicated_capture_count === 96, "Captured-CC worklist count changed");
  assert(worklist.items.every((item) => item.correction?.boundary_prosecution_state === "HOLD"), "Unreviewed worklist leaked a pass");
  const reported = new Set(["comin_true_cc_019", "comin_true_cc_020", "comin_true_cc_021"]);
  assert(worklist.items.filter((item) => reported.has(item.work_item_id)).every((item) => item.correction?.defect === "STEPS_PAST_LAST_AUDIBLE_VOCAL_NOTE_END"), "Owner-reported trespass defect missing");
  const fate = manifest.tugs.find((item) => item.ii_key === "comin_true_tug_space_and_faith");
  assert(fate?.display_title === "Only So Much Space and Fate", "FATE title correction missing");
  assert(fs.existsSync(publicPagePath), "Missing fail-closed public page");
  const page = fs.readFileSync(publicPagePath, "utf8");
  assert(page.includes('String(manifest.status) !== "PUBLIC_READY_COMPLETE_FAMILY"'), "Public page does not fail closed on HOLD");
}

console.log(`COMIN TRUE FAMILY AUDIT: PASS (${isPublic ? "PUBLIC" : "CAPTURED_CC_CORRECTION_HOLD"})`);
console.log(`HUGS=${manifest.counts.hug}`);
console.log(`TUGS=${manifest.counts.tug}`);
console.log(`BUGS=${manifest.counts.bug}`);
console.log(`STORY_BUGS=${manifest.counts.story_bug}`);
console.log(`TOTAL=${manifest.counts.total}`);
