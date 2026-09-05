import { validate4peIntakeEvidence } from "@/lib/kkr/intakeEvidenceGate";

export const R4U_CONTROL_VERSION = "R4U_INTAKE_CONTROL_V1" as const;
export type R4uLifecycle = "INTAKE" | "EVIDENCE_COMPLETE" | "BATCH_READY" | "REVIEWING" | "R4U_APPROVED" | "HOLD" | "REJECTED";

export function nextR4uLifecycle(evidence: unknown, batchRequest?: unknown): R4uLifecycle {
  const gate = validate4peIntakeEvidence(evidence);
  if (!gate.passed) return "INTAKE";
  const batch = batchRequest && typeof batchRequest === "object" ? batchRequest as Record<string, unknown> : {};
  const targets = [batch.kk_hug, batch.sk_tug, batch.mk_bug];
  if (targets.some((count) => !Number.isInteger(count) || Number(count) < 1 || Number(count) > 100)) return "EVIDENCE_COMPLETE";
  return "BATCH_READY";
}

export function canOrchestrateR4uBatch(run: { lifecycle_state?: unknown; evidence?: unknown; batch_request?: unknown }) {
  const gate = validate4peIntakeEvidence(run.evidence);
  const state = nextR4uLifecycle(run.evidence, run.batch_request);
  return { allowed: gate.passed && state === "BATCH_READY" && run.lifecycle_state === "BATCH_READY", reasons: gate.reasons, state };
}
