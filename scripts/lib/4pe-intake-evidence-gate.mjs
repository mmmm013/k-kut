const isTime = (value) => (typeof value === "number" || (typeof value === "string" && value.trim() !== "")) && Number.isFinite(Number(value)) && Number(value) >= 0;
const isRange = (pair) => isTime(pair?.start_sec) && isTime(pair?.end_sec) && Number(pair.end_sec) > Number(pair.start_sec);

export function validate4peIntakeEvidence(value) {
  const record = value && typeof value === "object" ? value : {};
  const intake = record.intake_evidence && typeof record.intake_evidence === "object" ? record.intake_evidence : record;
  const blks = Array.isArray(intake.blks) ? intake.blks : [];
  const reasons = [];
  if (intake.full_lyric_read !== true) reasons.push("full_lyric_authority_missing");
  if (!String(intake.lyric_authority_sha256 || "").trim()) reasons.push("lyric_authority_hash_missing");
  if (!String(intake.source_audio_sha256 || "").trim()) reasons.push("source_audio_hash_missing");
  if (!String(intake.lt_pix_track_id || "").trim() || !String(intake.in_pix_track_id || "").trim()) reasons.push("paired_lt_pix_in_pix_lineage_missing");
  if (!blks.length) reasons.push("no_blks");
  const pairIds = new Set();
  const blkIds = new Set();
  blks.forEach((blk, index) => {
    const tag = `blk_${index + 1}`;
    if (!String(blk?.id || "").trim()) reasons.push(`${tag}_id_missing`);
    if (!Array.isArray(blk?.lines) || blk?.lines.filter((line) => String(line).trim()).length < 2) reasons.push(`${tag}_not_multi_line`);
    if (!isRange(blk?.vtp)) reasons.push(`${tag}_vtp_missing_or_invalid`);
    if (!isRange(blk?.intp)) reasons.push(`${tag}_intp_missing_or_invalid`);
    if (!String(blk?.sister_pair_id || "").trim()) reasons.push(`${tag}_sister_pair_missing`);
    if (!String(blk?.mgs || "").trim()) reasons.push(`${tag}_mgs_missing`);
    // InTP = INSTRUMENTAL TOUCH POINT. One InTP pair embraces one VTP pair.
    if (isRange(blk?.vtp) && isRange(blk?.intp)) {
      if (Number(blk.intp.start_sec) > Number(blk.vtp.start_sec) ||
          Number(blk.vtp.end_sec) > Number(blk.intp.end_sec)) {
        reasons.push(`${tag}_intp_does_not_embrace_vtp`);
      }
      if (blks.some((other, otherIndex) => otherIndex !== index && isRange(other?.vtp) &&
          Number(blk.intp.start_sec) <= Number(other.vtp.start_sec) &&
          Number(other.vtp.end_sec) <= Number(blk.intp.end_sec))) {
        reasons.push(`${tag}_intp_embraces_another_vtp`);
      }
    }
    const pairId = String(blk?.sister_pair_id || "").trim();
    const blkId = String(blk?.id || "").trim();
    if (pairId && pairIds.has(pairId)) reasons.push(`${tag}_sister_pair_reused`);
    if (blkId && blkIds.has(blkId)) reasons.push(`${tag}_id_reused`);
    if (pairId) pairIds.add(pairId);
    if (blkId) blkIds.add(blkId);
  });
  return { passed: reasons.length === 0, reasons };
}
