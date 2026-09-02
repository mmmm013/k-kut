import fs from "node:fs";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";

const manifestPath = "data/ii-delivery-registry/comin-true-full-family-v1.json";
const sourcePath = "incoming/comin-true/COMIN_TRUE_FULL_LT_PIX_SSOT.mp3";
const expectedSourceSha256 = "fcf14e890b2c23c1eff1d213722332d67d282d9315c8b0e290fb2522fb092cda";
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
  return Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", file], { encoding: "utf8" }).trim());
}

assert(fs.existsSync(manifestPath), "Missing complete-family manifest");
assert(fs.existsSync(sourcePath), "Missing vocal LT-PIX source");
assert(sha256(sourcePath) === expectedSourceSha256, "Vocal LT-PIX source hash changed");

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
assert(manifest.status === "PUBLIC_READY_COMPLETE_FAMILY", "Family is not public-ready");
assert(manifest.source_audio_unchanged === true, "Source-audio law failed");
assert(manifest.counts.hug === 15, "Expected 15 HUGs");
assert(manifest.counts.tug === 49, "Expected 49 TUGs");
assert(manifest.counts.bug === 34, "Expected 34 BUGs");
assert(manifest.counts.story_bug === 3, "Expected 3 Story BUGs");
assert(manifest.counts.total === 101, "Expected 101 total IIs");

const all = [...manifest.hugs, ...manifest.tugs, ...manifest.bugs, ...manifest.story_bugs];
assert(new Set(all.map((item) => item.ii_key)).size === all.length, "Duplicate II keys");
assert(new Set(all.map((item) => item.checkout_url)).size === all.length, "Duplicate checkout identities");
for (const item of all) {
  assert(item.llbp_state === "PUBLIC_PASS", `LLBP did not pass: ${item.ii_key}`);
  assert(!/\b(BLK|KK\d|sK|mK|LNPR|LNTRIO|PHRZ|TWST|MTA4)\b/i.test(item.display_title), `Internal structure leaked into display: ${item.ii_key}`);
}

for (const item of manifest.tugs) {
  assert(item.platform === "TUG" && item.kut_form === "sK", `TUG/sK identity failed: ${item.ii_key}`);
  assert(item.form_keys.length > 0 && item.form_keys.every((form) => allowedSk.has(form)), `Invalid sK form: ${item.ii_key}`);
  assert(item.price_usd === "4.99", `TUG price failed: ${item.ii_key}`);
  assert(item.source_start_sec >= 12 && item.source_end_sec <= 135.497 && item.source_end_sec > item.source_start_sec, `TUG boundary failed: ${item.ii_key}`);
  const file = publicPath(item.audio_url);
  assert(fs.existsSync(file), `Missing TUG audio: ${file}`);
  assert(sha256(file) === item.sha256, `TUG hash mismatch: ${item.ii_key}`);
  assert(duration(file) > item.rendered_clip_end_sec - item.rendered_clip_start_sec + 2, `TUG delivery framing missing: ${item.ii_key}`);
}

const termVersions = new Map();
for (const item of manifest.bugs) {
  assert(item.platform === "BUG" && item.kut_form === "mK", `BUG/mK identity failed: ${item.ii_key}`);
  assert(allowedMk.has(item.form_key), `Invalid mK form: ${item.ii_key}`);
  assert(item.price_usd === "1.99", `BUG price failed: ${item.ii_key}`);
  assert(item.source_start_sec >= 12 && item.source_end_sec <= 135.497 && item.source_end_sec > item.source_start_sec, `BUG boundary failed: ${item.ii_key}`);
  const file = publicPath(item.audio_url);
  assert(fs.existsSync(file), `Missing BUG audio: ${file}`);
  assert(sha256(file) === item.sha256, `BUG hash mismatch: ${item.ii_key}`);
  assert(duration(file) > item.rendered_clip_end_sec - item.rendered_clip_start_sec + 2, `BUG delivery framing missing: ${item.ii_key}`);
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

console.log("COMIN TRUE COMPLETE FAMILY AUDIT: PASS");
console.log(`HUGS=${manifest.counts.hug}`);
console.log(`TUGS=${manifest.counts.tug}`);
console.log(`BUGS=${manifest.counts.bug}`);
console.log(`STORY_BUGS=${manifest.counts.story_bug}`);
console.log(`TOTAL=${manifest.counts.total}`);
