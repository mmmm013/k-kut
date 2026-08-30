import fs from "node:fs";

const parse = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const fail = (message) => { throw new Error(`PURCHASE CONTAINMENT AUDIT FAIL: ${message}`); };
const II_ID = "ii-romance-reuse-d3dfd13c-7421-4671-8261-0c735cb51f38";
const OPTION_ID = "generated-love-sweet-d3dfd13c-7421-4671-8261-0c735cb51f38";
const bridge = parse("data/publication-bridge/public-option-records.generated.json");
const canary = parse("data/production/first-production-canary-v1.json");
const privateAudio = parse("config/current-ii-private-audio.v1.json");
const registry = parse("data/ii-delivery-registry/romance-reusable-ii-records.json");

if ((canary.records || []).some(r => r.status === "STAGE")) fail("a STAGE II remains");
if ((bridge.records || []).some(r => r.payment_allowed || r.audio_delivery_url || r.stripe_url_if_payment_allowed)) {
  fail("public audio, payment, or Stripe exposure remains");
}
const option = (bridge.records || []).find(r => r.public_option_id === OPTION_ID);
if (!option || option.kk_id_or_delivery_object_id !== II_ID ||
    option.audio_proof_status !== "HOLD_UNVERIFIED_BOUNDARY_AND_CORRUPTED_TWINKLE") {
  fail("exact affected option is not held");
}
const privateRecord = (privateAudio.records || []).find(r => r.ii_id === II_ID);
if (privateRecord?.authority_state !== "HOLD_BOUNDARY_AND_TWINKLE_INTEGRITY" ||
    privateRecord.owner_review_enabled !== false) fail("contained private object can still be served");
const record = (registry.records || []).find(r => r.ii_id === II_ID);
if (record?.release_gate?.state !== "HOLD_BOUNDARY_AND_TWINKLE_INTEGRITY" ||
    (record.routes || []).some(r => r.payment_allowed || r.checkout_authority !== "HOLD")) {
  fail("registry release or checkout authority remains");
}
console.log("PURCHASE CONTAINMENT AUDIT: PASS");
console.log("STAGE IIs: 0");
console.log("PUBLIC AUDIO: 0");
console.log("PURCHASABLE OPTIONS: 0");
console.log("A LOVE LIKE THAT: HOLD_BOUNDARY_AND_TWINKLE_INTEGRITY");
