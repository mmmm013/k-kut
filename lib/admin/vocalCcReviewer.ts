type RecordValue = Record<string, unknown>;

const SHA256 = /^[a-f0-9]{64}$/i;

export function vocalCcRender(row: RecordValue) {
  const notes = row.method_notes && typeof row.method_notes === "object"
    ? row.method_notes as RecordValue
    : {};
  return {
    bucket: String(notes.rendered_cc_bucket || "tracks"),
    path: String(notes.rendered_cc_path || ""),
  };
}

/**
 * A vocal CC is the pre-II listening/edit unit. It must not be forced through a
 * KK/sK/mK definition before the owner has heard and accepted its TPR boundary.
 */
export function validateVocalCcForTpr(row: RecordValue) {
  const notes = row.method_notes && typeof row.method_notes === "object"
    ? row.method_notes as RecordValue
    : {};
  const render = vocalCcRender(row);
  const reasons: string[] = [];

  if (row.source_relation !== "VOCAL_LT_PIX_CC") reasons.push("vocal_cc_relation_required");
  if (!String(row.evidence_state || "").includes("MACHINE_PROSECUTED")) reasons.push("machine_prosecution_required");
  if (notes.full_lyric_read !== true) reasons.push("full_lyric_read_required");
  if (notes.legacy_fixed_window_used !== false) reasons.push("legacy_fixed_window_forbidden");
  if (notes.separation_operation !== "HTDEMUCS_TWO_STEMS_VOCALS_FROM_INSTRUMENTAL") reasons.push("vocal_instro_separation_required");
  if (!SHA256.test(String(notes.source_audio_sha256 || ""))) reasons.push("source_hash_required");
  if (!SHA256.test(String(notes.derived_vocal_evidence_sha256 || ""))) reasons.push("vocal_hash_required");
  if (!SHA256.test(String(notes.derived_in_pix_sha256 || ""))) reasons.push("in_pix_hash_required");
  if (!SHA256.test(String(notes.rendered_cc_sha256 || ""))) reasons.push("render_hash_required");
  if (!render.path || !render.bucket) reasons.push("private_render_required");
  if (!(Number(row.end_sec) > Number(row.start_sec))) reasons.push("valid_boundary_required");

  return { passed: reasons.length === 0, reasons };
}
