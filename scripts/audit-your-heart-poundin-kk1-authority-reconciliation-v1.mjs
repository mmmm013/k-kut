import fs from "node:fs";

const MANIFEST_PATH = "data/reconciliation/your-heart-poundin-kk1-authority-reconciliation.v1.json";
const REGISTRY_PATH = "data/ii-delivery-registry/romance-reusable-ii-records.json";
const PRIVATE_AUDIO_PATH = "config/current-ii-private-audio.v1.json";
const fail = (message) => {
  throw new Error(`YOUR HEART POUNDIN' KK1 AUTHORITY RECONCILIATION AUDIT FAIL: ${message}`);
};
const readJson = (path) => JSON.parse(fs.readFileSync(path, "utf8"));

const manifest = readJson(MANIFEST_PATH);
const registry = readJson(REGISTRY_PATH);
const privateAudio = readJson(PRIVATE_AUDIO_PATH);

if (manifest.authority !== "OWNER_APPROVED_PREPARE_AND_TEST_ONLY_2026_08_31") fail("authority scope changed");
if (manifest.execution_state !== "PREPARED_NOT_RELEASED") fail("manifest claims release");
if (manifest.write_policy !== "EXISTING_AUDIO_ONLY_NO_AUDIO_GENERATION_NO_SENSORY_NO_STRIPE") fail("write exclusions changed");

const subject = manifest.subject || {};
if (subject.title !== "YOUR HEART POUNDIN'") fail("title changed");
if (subject.canonical_track_id !== "c88dd65a-b536-485f-bf76-3c53fdf8a1e1") fail("canonical LT-PIX track changed");
if (subject.inventory_item_id !== 735 || subject.kk_no !== "01") fail("KK1 inventory identity changed");
if (subject.ii_key !== "II_V012_79308ff257e8cc95602d360ef6051a434fc24eca999a54ece2e1614403693988") fail("KK1 authority key changed");

const authority = manifest.authority_snapshot || {};
if (authority.original_start_seconds !== 0 || authority.original_end_seconds !== 34.125) fail("candidate boundary changed");
if (authority.intp_start_seconds !== 0 || authority.intp_end_seconds !== 34.125) fail("InTP evidence changed");
for (const key of ["vtp_start_seconds", "vtp_end_seconds", "final_start_seconds", "final_end_seconds"]) {
  if (authority[key] !== null) fail(`${key} may not be claimed before review`);
}
if (authority.kk_review_state !== "READY_FOR_KK_BOUNDARY_REVIEW") fail("KK review state changed");
if (authority.approval_state !== "NEEDS_GREGORY_REVIEW" || authority.public_state !== "NOT_PUBLIC") fail("candidate escaped review hold");

const record = registry.records?.find((row) => row.ii_id === "ii-romance-reuse-1f016b4a-f85d-4945-b881-2e0f571e6a49");
if (!record) fail("delivery registry record missing");
if (record.start_seconds !== 0 || record.end_seconds !== 34.125) fail("registry does not match KK1 candidate boundary");
if (record.boundary_authority?.superseded_fixed_window_end_seconds !== 24) fail("superseded 24-second window not preserved as evidence");
if (record.boundary_authority?.vtp_start_seconds !== null || record.boundary_authority?.final_end_seconds !== null) fail("unproven final boundary claimed");
if (record.delivery_audio_url !== "") fail("public delivery URL exposed");
if (record.routes?.some((route) => route.payment_allowed !== false || route.checkout_authority !== "HOLD")) fail("route escaped checkout hold");

const object = manifest.existing_private_delivery_object || {};
const configuredObject = privateAudio.records?.find((row) => row.ii_id === record.ii_id);
if (!configuredObject) fail("private audio configuration missing");
for (const key of ["object_path", "expected_sha256", "size_bytes", "duration_seconds"]) {
  const configuredKey = key === "object_path" ? "storage_object_path" : key === "expected_sha256" ? "sha256" : key;
  if (object[key] !== configuredObject[configuredKey]) fail(`${key} differs from private audio configuration`);
}
if (object.bucket_public !== false || record.private_delivery_audio?.visibility !== "private") fail("private storage requirement changed");
if (record.private_delivery_audio?.apply_state !== "PRESENT_PRIVATE_OBJECT_UNRELEASED") fail("storage presence reconciliation missing");
if (object.rendered_hash_verified_from_storage_bytes !== false || object.rendered_audio_listening_verified !== false) fail("rendered object proof falsely claimed");

const gate = manifest.release_gate || {};
for (const key of [
  "automatic_release",
  "public_audio_allowed",
  "free_delivery_allowed",
  "payment_allowed",
  "stripe_allowed",
  "audio_generation_allowed",
  "audio_mutation_allowed",
  "sensory_changes_allowed",
  "database_mutation_allowed",
  "storage_mutation_allowed",
  "merge_allowed_by_this_authority",
  "production_deploy_allowed_by_this_authority"
]) {
  if (gate[key] !== false) fail(`${key} must remain false`);
}
if (record.release_gate?.free_canary_eligible !== false) fail("record incorrectly allows free canary");
if (gate.required_future_authority !== "SEPARATE_EXPLICIT_OWNER_APPROVAL") fail("future owner authority missing");

console.log("YOUR HEART POUNDIN' KK1 AUTHORITY RECONCILIATION AUDIT: PASS");
console.log("KK1 CANDIDATE: 0.000-34.125 · VTP/FINAL UNPROVEN");
console.log("PRIVATE OBJECT: PRESENT · UNRELEASED · RENDERED PROOF PENDING");
console.log("FREE CANARY: INELIGIBLE · AUDIO GENERATION FALSE · SENSORY FALSE · STRIPE FALSE");
