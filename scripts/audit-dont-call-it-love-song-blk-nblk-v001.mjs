import fs from "node:fs";

const read = (file) => fs.readFileSync(file, "utf8");
const json = (file) => JSON.parse(read(file));
const fail = (message) => {
  throw new Error(`DON'T CALL IT LOVE AUDIT FAIL: ${message}`);
};

const song = json("data/track-digestion/dont-call-it-love/song-authority-v001.json");
const law = json("data/track-digestion/dont-call-it-love/blk-nblk-processing-law-v001.json");
const legacy = json("data/track-digestion/dont-call-it-love/legacy-window-reconciliation-v001.json");
const pilot = json("data/hug-pilot/bic-hug-revenue-pilot-v001.json");
const registry = json("data/ii-delivery-registry/romance-reusable-ii-records.json");
const publication = json("data/publication-bridge/public-option-records.generated.json");
const sensory = json("data/gpmc-sensory/sensory-emotional-records.generated.json");

const heldKk = "6e959ac6-9546-4bae-87b2-ed6584185682";
const heldIi = "ii-romance-reuse-6e959ac6-9546-4bae-87b2-ed6584185682";
const heldAudio = "/ii-delivery/romance/dont-call-it-love-6e959ac6-9546-4bae-87b2-ed6584185682-bookend-twinkle.mp3";
const parentTitle = "Don't Call It Love";

if (
  song.schema_version !== "GPMX_DONT_CALL_IT_LOVE_SONG_AUTHORITY_V001" ||
  song.status !== "GD_MEANING_LOCKED_PUBLIC_MATCHING_HELD"
) {
  fail("song authority missing or unlocked");
}

const statement = String(song.song_level_meaning?.primary_statement || "").toLowerCase();
for (const meaning of ["lack of commitment", "wanting sex", "resists calling the relationship love"]) {
  if (!statement.includes(meaning)) fail(`song meaning missing: ${meaning}`);
}

if (
  song.correction?.invalid_prior_route !== "repair-still-love-you" ||
  song.correction?.publication_approval_revoked !== true ||
  song.correction?.payment_approval_revoked !== true ||
  song.correction?.frontend_removal_required !== true ||
  song.correction?.descriptive_metadata_removal_required !== true ||
  song.correction?.mgs_removal_required !== true
) {
  fail("prior repair classification is not fully revoked");
}

if (
  song.evidence_state?.connected_drive_authorized_lyrics_found !== false ||
  song.evidence_state?.connected_drive_structural_section_map_found !== false ||
  song.evidence_state?.legacy_timed_candidates_are_structural_blks !== false ||
  song.evidence_state?.exact_blk_boundaries_proven !== false ||
  song.evidence_state?.exact_blk_lyrics_proven !== false ||
  song.evidence_state?.public_song_level_fit !== "HOLD"
) {
  fail("unproven BLK or song evidence was promoted");
}

if (
  law.schema_version !== "GPMX_DONT_CALL_IT_LOVE_BLK_NBLK_PROCESSING_LAW_V001" ||
  law.sequence?.join(" → ") !== "SONG → BLK → NBLK"
) {
  fail("song → BLK → NBLK sequence missing");
}

if (
  law.blk_law?.legacy_23_to_24_second_windows_are_blks !== false ||
  law.blk_law?.inherit_parent_meaning !== false ||
  law.blk_law?.multiple_meanings_must_be_preserved !== true ||
  law.blk_law?.contradictory_meanings_must_not_be_flattened !== true
) {
  fail("BLK independence law missing");
}

for (const key of [
  "unique_ii_required",
  "standalone_meaning_required",
  "exact_audio_boundary_required",
  "public_title_must_come_from_nblk_meaning",
  "public_description_must_describe_only_nblk",
  "public_mgs_must_describe_only_nblk",
  "adult_only_when_sexual",
  "consent_must_not_be_inferred",
  "relationship_status_must_not_be_inferred",
  "one_blk_may_create_multiple_nblks_only_when_each_has_distinct_complete_evidence",
  "one_nblk_may_support_multiple_needs_only_with_separate_fit_evidence"
]) {
  if (law.nblk_law?.[key] !== true) fail(`NBLK law missing: ${key}`);
}

for (const key of [
  "parent_title_on_frontend",
  "parent_artist_on_frontend",
  "parent_album_on_frontend",
  "parent_track_id_on_frontend",
  "parent_title_in_public_descriptive_metadata",
  "parent_title_in_public_mgs",
  "parent_meaning_inherited",
  "parent_mgs_inherited"
]) {
  if (law.nblk_law?.[key] !== false) fail(`parent stripping law missing: ${key}`);
}

if (
  law.frontend_law?.nblk_is_presented_as_unique_solo_ii !== true ||
  law.frontend_law?.internal_lineage_may_not_leak_through_url_title_alt_text_audio_label_or_checkout_copy !== true
) {
  fail("NBLK frontend isolation law missing");
}

if (
  legacy.schema_version !== "GPMX_DONT_CALL_IT_LOVE_LEGACY_WINDOW_RECONCILIATION_V001" ||
  legacy.status !== "ALL_LEGACY_WINDOWS_HELD_NOT_BLKS" ||
  legacy.legacy_evidence?.legacy_kk_candidate_count !== 24 ||
  legacy.legacy_evidence?.admin_only_mk_candidate_count !== 90 ||
  legacy.legacy_evidence?.legacy_route_result !== "NO REACHABLE KK FOUND FOR ROUTE: repair-still-love-you" ||
  legacy.legacy_evidence?.repair_route_usable_count !== 0 ||
  legacy.time_windows?.length !== 8 ||
  legacy.time_windows.some((window) => window.status !== "HOLD_NOT_BLK") ||
  legacy.public_inventory_created !== 0 ||
  legacy.audio_mutated !== 0
) {
  fail("legacy candidate hold reconciliation is incomplete");
}

if (
  pilot.records?.some((record) => record.ii_id === heldIi || record.kk_id === heldKk) ||
  !(pilot.held_records || []).some(
    (record) =>
      record.ii_id === heldIi &&
      record.status === "HOLD_SONG_BLK_NBLK_REPROCESSING_REQUIRED" &&
      record.payment_allowed === false,
  )
) {
  fail("pilot does not hold the misclassified source");
}

const registryRecord = (registry.records || []).find((record) => record.ii_id === heldIi);
if (
  !registryRecord ||
  registryRecord.kk_id !== heldKk ||
  registryRecord.routes?.length !== 0 ||
  registryRecord.public_use_status !== "HOLD" ||
  registryRecord.payment_allowed !== false ||
  registryRecord.frontend_allowed !== false ||
  registryRecord.descriptive_metadata_allowed !== false ||
  registryRecord.mgs_allowed !== false ||
  registryRecord.delivery_audio_url !== heldAudio
) {
  fail("registry held-source state is unsafe");
}

const publicationRecord = (publication.records || []).find(
  (record) => record.kk_id_or_delivery_object_id === heldIi,
);
if (
  !publicationRecord ||
  publicationRecord.approval_status !==
    "held_song_meaning_misclassification_blk_nblk_reprocessing_required" ||
  publicationRecord.payment_allowed !== false ||
  publicationRecord.stripe_url_if_payment_allowed !== "" ||
  publicationRecord.public_route !== "" ||
  publicationRecord.more_for_this_feeling_allowed !== false ||
  publicationRecord.more_from_this_track_allowed !== false
) {
  fail("publication or payment hold is incomplete");
}

const sensoryString = JSON.stringify(sensory).toLowerCase();
for (const forbidden of [
  heldKk.toLowerCase(),
  parentTitle.toLowerCase(),
  "repair-still-love-you",
  "repair / still love you"
]) {
  if (sensoryString.includes(forbidden)) {
    fail(`held source remains in public sensory metadata or MGS: ${forbidden}`);
  }
}

const publicFrontendFiles = [
  "app/hug-pilot/page.tsx",
  "app/personal/page.tsx",
  "app/personal/[slug]/page.tsx",
  "data/bic-routes/routes.json",
  "data/bic-usecases/routes.json"
];
for (const file of publicFrontendFiles) {
  const content = read(file).toLowerCase();
  for (const forbidden of [
    parentTitle.toLowerCase(),
    heldKk.toLowerCase(),
    heldAudio.toLowerCase(),
    "repair / still care",
    "repair / still love you",
    "repair-still-love-you"
  ]) {
    if (content.includes(forbidden)) {
      fail(`${file} leaks held source or false meaning: ${forbidden}`);
    }
  }
}

const productionAudit = read("scripts/bic-romance-production-audit.mjs");
if (
  !productionAudit.includes(parentTitle) ||
  !productionAudit.includes("Repair / Still Love You") ||
  !productionAudit.includes("FORBIDDEN_TEXT")
) {
  fail("production audit does not block the held parent and false route");
}

const sensoryGenerator = read("scripts/generate-gpmc-sensory-records-from-public-options.mjs");
for (const required of [
  'record.approval_status === "public_approved_generated_from_reusable_ii"',
  "record.payment_allowed === true",
  "forbiddenPublicSourceIds",
  "HELD DON'T CALL IT LOVE SOURCE REACHED PUBLIC SENSORY/MGS GENERATION"
]) {
  if (!sensoryGenerator.includes(required)) fail(`sensory generator control missing: ${required}`);
}

const routerGenerator = read("scripts/populate-romance-router.mjs");
for (const required of [
  "heldSourceIds",
  "heldTitles",
  "heldRouteIds",
  "HELD DON'T CALL IT LOVE SOURCE REENTERED ROMANCE ROUTER"
]) {
  if (!routerGenerator.includes(required)) fail(`router generator control missing: ${required}`);
}

const shortlistGenerator = read("scripts/make-romance-sales-shortlist.mjs");
for (const required of [
  "heldIds",
  "heldTitles",
  "repair-still-love-you",
  "HELD DON'T CALL IT LOVE SOURCE ENTERED ROMANCE SHORTLIST"
]) {
  if (!shortlistGenerator.includes(required)) fail(`shortlist control missing: ${required}`);
}

console.log("DON'T CALL IT LOVE SONG → BLK → NBLK AUDIT: PASS");
console.log("SONG MEANING: NONCOMMITMENT + SEXUAL DESIRE");
console.log("FALSE REPAIR / CONTINUED-CARE ROUTE: REVOKED");
console.log("LEGACY WINDOWS: 8 HOLD · 0 STRUCTURAL BLKs CLAIMED");
console.log("PUBLIC SENSORY METADATA / MGS: 0 RECORDS");
console.log("PILOT / CHECKOUT: HELD");
console.log("NBLK PUBLIC PARENT LEAKAGE: PROHIBITED");
console.log("AUDIO MUTATION: 0");
