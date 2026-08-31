import fs from "node:fs";

const PATH = "data/reprosecution/a-love-like-that-twinkle-reprosecution-manifest.v1.json";
const fail = (message) => { throw new Error(`A LOVE LIKE THAT / TWINKLE RE-PROSECUTION MANIFEST AUDIT FAIL: ${message}`); };
const manifest = JSON.parse(fs.readFileSync(PATH, "utf8"));

if (manifest.authority !== "OWNER_APPROVED_PREPARE_AND_TEST_ONLY_2026_08_30") fail("authority scope changed");
if (manifest.execution_state !== "PREPARED_NOT_EXECUTED") fail("manifest claims execution");
if (manifest.production_state !== "HOLD_BOUNDARY_AND_TWINKLE_INTEGRITY") fail("production hold changed");
if (manifest.subject?.canonical_lt_pix_track_id !== "41c9fe20-76cf-42ad-85d5-beab1d433dea") fail("canonical LT-PIX identity changed");
if (manifest.subject?.legacy_kk_id_not_lt_pix_id !== "d3dfd13c-7421-4671-8261-0c735cb51f38") fail("legacy KK identity missing");
if (manifest.subject?.legacy_kk_disposition !== "HOLD_NOT_BLK") fail("legacy window is not fail-closed");

const evidence = manifest.existing_candidate_evidence || [];
if (evidence.length !== 5) fail("expected five preserved candidate rows");
if (new Set(evidence.map(row => row.ii_key)).size !== evidence.length) fail("candidate II keys are not unique");
if (manifest.candidate_evidence_law?.evidence_only !== true || manifest.candidate_evidence_law?.may_establish_blk !== false || manifest.candidate_evidence_law?.may_be_served_or_sold !== false) fail("candidate evidence may escape hold");

const steps = manifest.single_linear_reprosecution || [];
if (steps.length !== 9 || steps.some((step, index) => step.step !== index + 1)) fail("re-prosecution is not one linear nine-step sequence");
if (!steps[3]?.required_result?.includes("fractionally before first verified InTP/VTP trigger")) fail("BLK1 start law missing");
if (!steps[4]?.required_result?.includes("CC.start >= BLK.start") || !steps[4]?.required_result?.includes("CC.end <= BLK.end") || !steps[4]?.required_result?.includes("exactly one blk_id")) fail("single-BLK CC law missing");
if (!steps[5]?.required_result?.includes("decoded duration")) fail("rendered-byte verification missing");
if (!steps[6]?.required_result?.includes("75-percent standard gain")) fail("Twinkle standard missing");

const gate = manifest.release_gate || {};
for (const field of ["automatic_release", "audio_allowed", "payment_allowed", "stripe_allowed", "twinkle_materialization_allowed", "database_mutation_allowed", "storage_mutation_allowed", "merge_allowed_by_this_authority", "production_deploy_allowed_by_this_authority"]) {
  if (gate[field] !== false) fail(`${field} must remain false`);
}
if (gate.required_future_authority !== "SEPARATE_EXPLICIT_OWNER_APPROVAL") fail("future owner authority requirement missing");

console.log("A LOVE LIKE THAT / TWINKLE RE-PROSECUTION MANIFEST AUDIT: PASS");
console.log("STATE: PREPARED_NOT_EXECUTED");
console.log("CANDIDATE EVIDENCE: 5 · ALL HOLD_NOT_BLK / NOT SERVEABLE");
console.log("RELEASE: AUDIO FALSE · PAYMENT FALSE · STRIPE FALSE");
console.log("NEXT: EXECUTE STEP 1 ONLY AFTER SEPARATE OWNER APPROVAL");
