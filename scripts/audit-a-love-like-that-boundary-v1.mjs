import fs from "node:fs";

const parse = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const fail = (message) => { throw new Error(`A LOVE LIKE THAT HOLD AUDIT FAIL: ${message}`); };
const II_ID = "ii-romance-reuse-d3dfd13c-7421-4671-8261-0c735cb51f38";
const registry = parse("data/ii-delivery-registry/romance-reusable-ii-records.json");
const canary = parse("data/production/first-production-canary-v1.json");
const bridge = parse("data/publication-bridge/public-option-records.generated.json");
const record = (registry.records || []).find(r => r.ii_id === II_ID);
const canaryRecord = (canary.records || []).find(r => r.ii_id === II_ID);
const rows = (bridge.records || []).filter(r => r.kk_id_or_delivery_object_id === II_ID);

if (!record || record.boundary_authority?.owner_confirmation_state !== "REVOKED_BY_OWNER_BOUNDARY_FAILURE_2026_08_30") {
  fail("invalid boundary approval was not revoked");
}
if (record.delivery_materialization?.integrity_state !== "HOLD_CORRUPTED_TWINKLE_REPORTED_BY_OWNER") {
  fail("corrupted Twinkle evidence is not held");
}
if (canaryRecord?.status !== "TRIAGE" || canaryRecord.delivery_audio_url !== "" ||
    !canaryRecord.missing_current_proof?.includes("rendered_audio_endpoint_within_blk") ||
    !canaryRecord.missing_current_proof?.includes("uncorrupted_owner_approved_twinkle")) {
  fail("canary does not require independent endpoint and Twinkle proof");
}
if (!rows.length || rows.some(r => r.payment_allowed || r.audio_delivery_url || r.stripe_url_if_payment_allowed)) {
  fail("affected public route still exposes audio or payment");
}
console.log("A LOVE LIKE THAT INTEGRITY HOLD: PASS");
console.log("PRIOR 0.000-34.875 CLAIM: REVOKED");
console.log("RENDERED ENDPOINT PROOF: REQUIRED");
console.log("OWNER-APPROVED TWINKLE PROOF: REQUIRED");
