import { validate4peIntakeEvidence } from "@/lib/kkr/intakeEvidenceGate";

export const II_TYPES = ["KK", "sK", "mK"] as const;
export type IiType = (typeof II_TYPES)[number];

type Candidate = Record<string, unknown>;

export function normalizeLyricToken(value: string) {
  return value.toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}

export function validateIiDefinition(candidate: Candidate) {
  const type = candidate.ii_type;
  const definition = candidate.definition_proof;
  const proof = definition && typeof definition === "object" ? definition as Record<string, unknown> : {};
  const reasons: string[] = [];
  if (!II_TYPES.includes(type as IiType)) reasons.push("ii_type_required");
  if (proof.definition_version !== "II_DEFINITION_V1") reasons.push("definition_version_required");
  if (proof.type !== type) reasons.push("definition_type_mismatch");
  if (proof.script_status !== "PASS") reasons.push("type_specific_script_not_passed");
  if (proof.authority !== "VOCAL_LT_PIX_BLK") reasons.push("vocal_lt_pix_blk_authority_required");
  if (proof.fixed_duration_source === true || proof.legacy_slice === true) reasons.push("legacy_fixed_duration_source_forbidden");
  if (typeof candidate.lt_pix_track_id !== "string" || !candidate.lt_pix_track_id) reasons.push("unique_vocal_lt_pix_required");
  if (typeof candidate.in_pix_track_id !== "string" || !candidate.in_pix_track_id) reasons.push("paired_in_pix_required");
  if (candidate.lt_pix_track_id === candidate.in_pix_track_id) reasons.push("vocal_in_pix_must_be_distinct");
  if (typeof candidate.source_audio_sha256 !== "string" || !/^[a-f0-9]{64}$/i.test(candidate.source_audio_sha256)) reasons.push("vocal_source_hash_required");
  return { passed: reasons.length === 0, reasons };
}

export function validateBicCandidate(candidate: Candidate) {
  const intake = validate4peIntakeEvidence(candidate.evidence);
  const definition = validateIiDefinition(candidate);
  const rendering = candidate.rendering && typeof candidate.rendering === "object" ? candidate.rendering as Record<string, unknown> : {};
  const renderingReasons: string[] = [];
  if (rendering.source !== "VOCAL_LT_PIX") renderingReasons.push("vocal_lt_pix_render_required");
  if (rendering.status !== "VERIFIED") renderingReasons.push("render_verification_required");
  if (typeof rendering.private_object_path !== "string" || !rendering.private_object_path) renderingReasons.push("private_render_path_required");
  return { passed: intake.passed && definition.passed && renderingReasons.length === 0, reasons: [...intake.reasons, ...definition.reasons, ...renderingReasons] };
}
