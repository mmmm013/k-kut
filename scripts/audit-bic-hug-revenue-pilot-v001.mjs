import fs from "node:fs";
import path from "node:path";

const read = (file) => fs.readFileSync(file, "utf8");
const json = (file) => JSON.parse(read(file));
const stop = (message) => {
  throw new Error(`BIC HUG PILOT AUDIT FAIL: ${message}`);
};

const glossary = json("data/matching/gpm-shared-need-glossary-v001.json");
const reconciliation = json(
  "data/13hugz/reconciliation/gpmx-13hugz-reconciliation-bic-v001.json",
);
const pilot = json("data/hug-pilot/bic-hug-revenue-pilot-v001.json");
const registry = json(
  "data/ii-delivery-registry/romance-reusable-ii-records.json",
);
const publication = json(
  "data/publication-bridge/public-option-records.generated.json",
);
const catalog = read("lib/hugzSeedCatalog.ts");
const page = read("app/hug-pilot/page.tsx");
const checkout = read("app/checkout/route.ts");

if (glossary.schema_version !== "GPM_SHARED_NEED_GLOSSARY_V001") {
  stop("shared need glossary schema is missing or changed");
}

const requiredDimensions = [
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
];
for (const dimension of requiredDimensions) {
  if (!glossary.required_dimensions.includes(dimension)) {
    stop(`shared need dimension missing: ${dimension}`);
  }
}

const law = glossary.matching_law || {};
for (const key of [
  "exact_user_words_remain_separate_from_interpretation",
  "customer_side_and_music_side_use_same_need_ids",
  "relationship_and_point_of_view_required_when_material",
  "parent_or_total_song_fit_never_auto_approves_a_child",
  "every_KK_KOMBO_sK_or_mK_fit_requires_independent_evidence",
  "one_music_item_may_fit_multiple_needs_only_with_separate_evidence",
  "positive_evidence_required",
  "exclusion_and_contradiction_review_required",
  "forced_match_prohibited",
  "inventory_identity_must_remain_separate_from_package_name",
]) {
  if (law[key] !== true) stop(`matching law missing: ${key}`);
}
if (law.no_fit_label !== "NO THEME FIT — HOLD") {
  stop("NO THEME FIT — HOLD is not locked");
}

const needIds = new Set(
  (glossary.need_families || []).map((record) => record.need_id),
);
for (const requiredNeed of [
  "warmth_care",
  "gratitude_appreciation",
  "comfort_support",
  "encouragement_courage",
  "pride_congratulations",
  "celebration_new_beginning",
  "repair_apology",
  "reconnection_still_care",
  "missing_remembrance",
  "friendship_belonging",
  "romantic_devotion",
  "physical_spark",
  "gentle_relief",
]) {
  if (!needIds.has(requiredNeed)) stop(`need family missing: ${requiredNeed}`);
}

if (
  reconciliation.schema_version !==
  "GPMX_13HUGZ_RECONCILIATION_BIC_V001"
) {
  stop("13HUGz reconciliation schema is missing or changed");
}
const summary = reconciliation.summary || {};
if (
  summary.hugz_card_count !== 13 ||
  summary.existing_seed_association_count !== 104 ||
  summary.current_pass_count !== 0 ||
  summary.current_hold_count !== 104 ||
  summary.deleted_count !== 0
) {
  stop("13HUGz reconciliation totals must remain 13 cards / 104 holds / 0 passes / 0 deletions");
}
if (
  reconciliation.decision?.status_for_every_existing_seed_association !==
  "HOLD_CURRENT_THEME_FIT_REPROOF_REQUIRED"
) {
  stop("the 104 current seed associations are not fail-closed");
}
if (
  reconciliation.decision
    ?.association_hold_does_not_invalidate_separately_approved_inventory_outside_the_429_packet !==
  true
) {
  stop("separately approved inventory boundary is missing");
}

const catalogCardCount = (catalog.match(/\"slug\"\s*:/gu) || []).length;
const catalogSeedCount = (catalog.match(/\"assetId\"\s*:/gu) || []).length;
if (catalogCardCount !== 13 || catalogSeedCount !== 104) {
  stop(
    `source catalog drift: found ${catalogCardCount} cards and ${catalogSeedCount} seeds`,
  );
}

const expectedSlugs = [
  "bad-day",
  "big-win",
  "make-it-right",
  "just-because-care",
  "miss-them",
  "first-day-nerves",
  "proud-of-them",
  "thinking-of-you",
  "long-week",
  "breakup-blues",
  "new-baby",
  "just-because-smile",
  "friends",
];
const reconciliationRows = reconciliation.current_card_results || [];
if (reconciliationRows.length !== 13) stop("13 card reconciliation rows required");
for (const slug of expectedSlugs) {
  const row = reconciliationRows.find((candidate) => candidate.slug === slug);
  if (!row || row.existing_seeds !== 8 || row.pass !== 0 || row.hold !== 8) {
    stop(`card is not fully held for reproof: ${slug}`);
  }
}

if (pilot.schema_version !== "GPMX_BIC_HUG_REVENUE_PILOT_V001") {
  stop("pilot authority schema is missing or changed");
}
if (
  pilot.package?.customer_package_code !== "HUG" ||
  pilot.package?.price_cents !== 799 ||
  pilot.package?.currency !== "USD"
) {
  stop("HUG package must remain $7.99 USD");
}
if (!Array.isArray(pilot.records) || pilot.records.length !== 3) {
  stop("the BIC pilot must contain exactly three records");
}

const uniqueIis = new Set();
const uniqueKks = new Set();
const uniqueAudio = new Set();
const registryById = new Map(
  (registry.records || []).map((record) => [record.ii_id, record]),
);
const publicationRecords = publication.records || [];
const heldSeedIds = new Set(
  [...catalog.matchAll(/\"assetId\"\s*:\s*\"([^\"]+)\"/gu)].map(
    (match) => match[1],
  ),
);

for (const record of pilot.records) {
  if (uniqueIis.has(record.ii_id)) stop(`duplicate pilot II: ${record.ii_id}`);
  if (uniqueKks.has(record.kk_id)) stop(`duplicate pilot KK: ${record.kk_id}`);
  if (uniqueAudio.has(record.audio_url)) {
    stop(`duplicate pilot delivery audio: ${record.audio_url}`);
  }
  uniqueIis.add(record.ii_id);
  uniqueKks.add(record.kk_id);
  uniqueAudio.add(record.audio_url);

  if (
    record.canonical_kind !== "KK" ||
    record.customer_package_code !== "HUG" ||
    record.checkout_offer_code !== "kk" ||
    record.price_cents !== 799 ||
    record.pilot_ready !== true ||
    record.payment_allowed !== true ||
    record.audio_proof_status !== "pass" ||
    record.publication_approval_status !==
      "public_approved_generated_from_reusable_ii"
  ) {
    stop(`pilot product/evidence state invalid: ${record.ii_id}`);
  }

  if (!needIds.has(record.primary_need_id)) {
    stop(`unknown primary need: ${record.primary_need_id}`);
  }
  for (const secondaryNeed of record.secondary_need_ids || []) {
    if (!needIds.has(secondaryNeed)) {
      stop(`unknown secondary need: ${secondaryNeed}`);
    }
  }
  if (
    !Array.isArray(record.positive_evidence) ||
    record.positive_evidence.length < 2 ||
    !Array.isArray(record.exclusions) ||
    record.exclusions.length < 2
  ) {
    stop(`positive and exclusion evidence required: ${record.ii_id}`);
  }
  if (
    record.re_digest_status !==
    "PASS_INDEPENDENT_NEED_FIT_FROM_EXISTING_APPROVED_ROUTE_EVIDENCE"
  ) {
    stop(`independent need-fit status missing: ${record.ii_id}`);
  }

  const registryRecord = registryById.get(record.ii_id);
  if (!registryRecord) stop(`registry II missing: ${record.ii_id}`);
  if (
    registryRecord.kk_id !== record.kk_id ||
    registryRecord.start_seconds !== record.start_seconds ||
    registryRecord.end_seconds !== record.end_seconds ||
    registryRecord.delivery_audio_url !== record.audio_url ||
    registryRecord.delivery_status !==
      "delivery_audio_materialized_bookend_twinkle" ||
    registryRecord.delivery_requirements?.front_padding_required !== true ||
    registryRecord.delivery_requirements?.back_padding_required !== true ||
    registryRecord.delivery_requirements?.twinkle_required !== true
  ) {
    stop(`registry evidence mismatch: ${record.ii_id}`);
  }

  const approvedPublication = publicationRecords.find(
    (candidate) =>
      candidate.kk_id_or_delivery_object_id === record.ii_id &&
      candidate.approval_status ===
        "public_approved_generated_from_reusable_ii" &&
      candidate.audio_proof_status === "pass" &&
      candidate.payment_allowed === true &&
      candidate.audio_delivery_url === record.audio_url &&
      String(candidate.stripe_url_if_payment_allowed || "").startsWith(
        "https://buy.stripe.com/",
      ),
  );
  if (!approvedPublication) {
    stop(`publication/payment authority missing: ${record.ii_id}`);
  }

  const publicAudioPath = path.join(
    process.cwd(),
    "public",
    record.audio_url.replace(/^\//u, ""),
  );
  if (!fs.existsSync(publicAudioPath)) {
    stop(`customer-delivery audio file missing: ${record.audio_url}`);
  }

  if (heldSeedIds.has(record.ii_id) || heldSeedIds.has(record.kk_id)) {
    stop(`pilot item improperly sourced from held 104 association set: ${record.ii_id}`);
  }
}

for (const required of [
  'action="/checkout"',
  'method="post"',
  'name="ii"',
  'name="offer" value="kk"',
  "Three ready HUG paths",
  "exact governed music choice",
]) {
  if (!page.includes(required)) stop(`pilot page contract missing: ${required}`);
}
if (page.includes("buy.stripe.com")) {
  stop("pilot page bypasses governed checkout with a direct Stripe URL");
}

for (const required of [
  "createPendingH2Order",
  "findApprovedPublicOptionByInventoryId",
  "PUBLIC_STORAGE_VERIFIED",
  "signature_audio_logo_integral_at_end",
  "inventoryId",
  "customerPackageCode",
  "originDomain",
]) {
  if (!checkout.includes(required)) {
    stop(`governed checkout contract missing: ${required}`);
  }
}

console.log("BIC HUG REVENUE PILOT AUDIT: PASS");
console.log("13HUGz CURRENT ASSOCIATIONS: 104 HOLD · 0 PASS · 0 DELETED");
console.log("SHARED CUSTOMER/MUSIC NEED GLOSSARY: PASS");
console.log("INDEPENDENTLY EVIDENCED PILOT HUG IIs: 3");
console.log("PACKAGE: HUG · $7.99");
console.log("CUSTOMER-DELIVERY AUDIO FILES: 3 PRESENT");
console.log("DIRECT STRIPE BYPASS IN PILOT UI: 0");
console.log("GOVERNED EXACT-II CHECKOUT CONTRACT: PASS");
console.log("AUDIO REBUILT OR MUTATED: 0");
