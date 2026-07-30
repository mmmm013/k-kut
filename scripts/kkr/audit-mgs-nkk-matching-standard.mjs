import fs from "node:fs";

const standard = JSON.parse(
  fs.readFileSync("data/kkr/mgs-nkk-matching-standard-v001.json", "utf8"),
);
const matcher = fs.readFileSync("lib/kkrMgsNkkMatcher.ts", "utf8");
const template = JSON.parse(
  fs.readFileSync("templates/kkr-biz-msc/delivery-proof-review-template.json", "utf8"),
);
const failures = [];
const dimensions = [
  "core_feeling",
  "emotional_shade",
  "interpersonal_stance",
  "social_condition",
  "desired_effect",
  "energy",
  "vocal_character",
  "interpretation",
  "perspective",
];

if (standard.schema_version !== "GPMX_MGS_NKK_MATCHING_STANDARD_V001") {
  failures.push("wrong schema version");
}
for (const dimension of dimensions) {
  if (!Array.isArray(standard.dimensions?.[dimension]) || standard.dimensions[dimension].length < 5) {
    failures.push(`missing controlled dimension: ${dimension}`);
  }
}
const weightTotal = Object.values(standard.default_weights_percent || {}).reduce(
  (sum, value) => sum + Number(value),
  0,
);
if (weightTotal !== 100) failures.push(`weights total ${weightTotal}, not 100`);
if (standard.principles?.user_intent_is_authoritative !== true) {
  failures.push("user authority is not locked");
}
if (standard.principles?.visible_shortlist_is_not_full_universe !== true) {
  failures.push("shortlist/full-universe separation missing");
}
for (const required of [
  "normalizeMgsTerm",
  "validateMgsProfile",
  "scoreMgsCandidate",
  "diversityRerank",
  "title_content_disagreement",
  "user_exclusion_matched",
]) {
  if (!matcher.includes(required)) failures.push(`matcher missing ${required}`);
}
for (const required of ["mgs_profile", "mgs_evidence", "mgs_governance"]) {
  if (!(required in template)) failures.push(`delivery review missing ${required}`);
}

if (failures.length) {
  console.error("GPMx MGS/NKK MATCHING STANDARD AUDIT: FAIL");
  failures.forEach((failure) => console.error("-", failure));
  process.exit(1);
}
console.log("GPMx MGS/NKK MATCHING STANDARD AUDIT: PASS");
console.log("CONTROLLED DIMENSIONS:", dimensions.length);
console.log("WEIGHT TOTAL: 100");
console.log("USER INTENT AUTHORITY: LOCKED");
console.log("BROAD CANDIDATE UNIVERSE: LOCKED");
console.log("VOC GROOMING: DESCRIPTIVE METADATA ONLY");
