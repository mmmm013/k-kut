import { validate4peIntakeEvidence } from "@/lib/kkr/intakeEvidenceGate";

export const FACTORY_STAGES = ["KK", "mK", "sK", "KOMBO"] as const;
export type FactoryStage = (typeof FACTORY_STAGES)[number];
type RecordLike = Record<string, unknown>;

export function stageEnabled(stage: FactoryStage, controls: RecordLike) {
  return controls[`${stage.toLowerCase()}_enabled`] === true;
}
export function validateFactoryRun(input: RecordLike, controls: RecordLike) {
  const stage = input.stage as FactoryStage;
  const reasons: string[] = [];
  if (!FACTORY_STAGES.includes(stage)) reasons.push("factory_stage_required");
  else if (!stageEnabled(stage, controls)) reasons.push(`stage_locked_${stage.toLowerCase()}`);
  if (!String(input.vocal_lt_pix_track_id || "").trim()) reasons.push("vocal_lt_pix_track_required");
  if (!String(input.paired_in_pix_track_id || "").trim()) reasons.push("paired_in_pix_track_required");
  if (input.vocal_lt_pix_track_id === input.paired_in_pix_track_id) reasons.push("paired_tracks_must_be_distinct");
  if (input.stage !== "KK") reasons.push("kk_stabilization_required_before_later_types");
  const evidence = validate4peIntakeEvidence(input.evidence);
  return { passed: reasons.length === 0 && evidence.passed, reasons: [...reasons, ...evidence.reasons] };
}
export function runKey(trackId: string, stage: FactoryStage, sourceHash: string) { return `${trackId}:${stage}:${sourceHash}`; }
