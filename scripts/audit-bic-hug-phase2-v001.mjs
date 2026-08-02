import fs from "node:fs";

const json = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const fail = (message) => {
  throw new Error(`BIC PHASE 2 FAIL: ${message}`);
};

const glossary = json("data/matching/gpm-shared-need-glossary-v001.json");
const pilot = json("data/hug-pilot/bic-hug-revenue-pilot-v001.json");
const registry = json(
  "data/ii-delivery-registry/romance-reusable-ii-records.json",
);

if (
  pilot.schema_version !== "GPMX_BIC_HUG_REVENUE_PILOT_V001" ||
  pilot.package?.customer_package_code !== "HUG" ||
  pilot.package?.price_cents !== 799 ||
  pilot.package?.currency !== "USD" ||
  !Array.isArray(pilot.records) ||
  pilot.records.length !== 3
) {
  fail("pilot package or count");
}

const needIds = new Set(
  (glossary.need_families || []).map((record) => record.need_id),
);
const registryById = new Map(
  (registry.records || []).map((record) => [record.ii_id, record]),
);
const uniqueIis = new Set();
const uniqueKks = new Set();
const uniqueAudio = new Set();

for (const record of pilot.records) {
  if (
    uniqueIis.has(record.ii_id) ||
    uniqueKks.has(record.kk_id) ||
    uniqueAudio.has(record.audio_url)
  ) {
    fail("duplicate II, KK, or audio");
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
      "public_approved_generated_from_reusable_ii" ||
    record.re_digest_status !==
      "PASS_INDEPENDENT_NEED_FIT_FROM_EXISTING_APPROVED_ROUTE_EVIDENCE"
  ) {
    fail("pilot evidence state");
  }

  if (!needIds.has(record.primary_need_id)) fail("primary need");
  for (const needId of record.secondary_need_ids || []) {
    if (!needIds.has(needId)) fail("secondary need");
  }
  if (
    !Array.isArray(record.positive_evidence) ||
    record.positive_evidence.length < 2 ||
    !Array.isArray(record.exclusions) ||
    record.exclusions.length < 2
  ) {
    fail("positive or exclusion evidence");
  }

  const authority = registryById.get(record.ii_id);
  if (!authority) fail("registry II missing");
  if (
    authority.kk_id !== record.kk_id ||
    authority.start_seconds !== record.start_seconds ||
    authority.end_seconds !== record.end_seconds ||
    authority.delivery_audio_url !== record.audio_url ||
    authority.delivery_status !==
      "delivery_audio_materialized_bookend_twinkle" ||
    authority.delivery_requirements?.front_padding_required !== true ||
    authority.delivery_requirements?.back_padding_required !== true ||
    authority.delivery_requirements?.twinkle_required !== true
  ) {
    fail("registry evidence mismatch");
  }
}

console.log("BIC HUG AUDIT PHASE 2: PASS");
