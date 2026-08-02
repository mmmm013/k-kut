import fs from "node:fs";

const read = (file) => fs.readFileSync(file, "utf8");
const json = (file) => JSON.parse(read(file));
const fail = (message) => {
  throw new Error(`BIC PHASE 1 FAIL: ${message}`);
};

const glossary = json("data/matching/gpm-shared-need-glossary-v001.json");
const reconciliation = json(
  "data/13hugz/reconciliation/gpmx-13hugz-reconciliation-bic-v001.json",
);
const catalog = read("lib/hugzSeedCatalog.ts");

if (glossary.schema_version !== "GPM_SHARED_NEED_GLOSSARY_V001") {
  fail("glossary schema");
}
for (const dimension of [
  "exact_user_words",
  "relationship",
  "point_of_view",
  "what_happened",
  "desired_effect",
  "primary_need",
  "emotion",
  "mood",
  "sentiment",
  "intensity",
  "time_orientation",
  "occasion",
  "positive_requirements",
  "exclusions",
  "contradictions",
]) {
  if (!glossary.required_dimensions.includes(dimension)) fail(`dimension ${dimension}`);
}
if (
  glossary.matching_law?.customer_side_and_music_side_use_same_need_ids !== true ||
  glossary.matching_law?.forced_match_prohibited !== true ||
  glossary.matching_law?.no_fit_label !== "NO THEME FIT — HOLD"
) {
  fail("matching law");
}

const summary = reconciliation.summary || {};
if (
  reconciliation.schema_version !==
    "GPMX_13HUGZ_RECONCILIATION_BIC_V001" ||
  summary.hugz_card_count !== 13 ||
  summary.existing_seed_association_count !== 104 ||
  summary.current_pass_count !== 0 ||
  summary.current_hold_count !== 104 ||
  summary.deleted_count !== 0
) {
  fail("reconciliation totals");
}
if (
  reconciliation.decision?.status_for_every_existing_seed_association !==
  "HOLD_CURRENT_THEME_FIT_REPROOF_REQUIRED"
) {
  fail("hold status");
}

const sourceCards = (catalog.match(/"slug"\s*:/gu) || []).length;
const sourceSeeds = (catalog.match(/"assetId"\s*:/gu) || []).length;
if (sourceCards !== 13 || sourceSeeds !== 104) {
  fail(`catalog count ${sourceCards}/${sourceSeeds}`);
}
if (
  reconciliation.current_card_results?.length !== 13 ||
  reconciliation.current_card_results.some(
    (row) => row.existing_seeds !== 8 || row.pass !== 0 || row.hold !== 8,
  )
) {
  fail("per-card reconciliation");
}

console.log("BIC HUG AUDIT PHASE 1: PASS");
