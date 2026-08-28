import fs from "node:fs";
import path from "node:path";

export type ApprovedPublicOption = {
  public_option_id: string;
  source_pix_id_or_track_id: string;
  kk_id_or_delivery_object_id: string;
  display_title: string;
  interpretation_summary: string;
  action_object_meaning?: { verb?: string; object?: string; situation?: string };
  intent_lane: string;
  approval_status: string;
  audio_delivery_url: string;
  audio_proof_status: string;
  payment_allowed: boolean;
  stripe_url_if_payment_allowed?: string;
  public_route: string;
};

const BRIDGE_PATH = path.join(process.cwd(), "data", "publication-bridge", "public-option-records.generated.json");
const CANARY_PATH = path.join(process.cwd(), "data", "production", "first-production-canary-v1.json");

const APPROVED_PUBLICATION_STATUSES = new Set([
  "public_approved_from_mial",
  "public_approved_generated_from_reusable_ii",
]);

function stagedCanaryIds(): Set<string> {
  if (!fs.existsSync(CANARY_PATH)) return new Set();
  const parsed = JSON.parse(fs.readFileSync(CANARY_PATH, "utf8")) as {
    records?: Array<{ ii_id?: string; status?: string }>;
  };
  return new Set((parsed.records || []).filter(r => r.status === "STAGE").map(r => r.ii_id || "").filter(Boolean));
}

function isApproved(record: ApprovedPublicOption, staged: Set<string>): boolean {
  return Boolean(
    staged.has(record.public_option_id) &&
      APPROVED_PUBLICATION_STATUSES.has(record.approval_status) &&
      record.audio_proof_status === "pass" &&
      record.payment_allowed === true &&
      record.audio_delivery_url?.startsWith("/") &&
      record.public_route?.startsWith("/") &&
      record.display_title?.trim() &&
      record.interpretation_summary?.trim()
  );
}

function allRecords(): ApprovedPublicOption[] {
  if (!fs.existsSync(BRIDGE_PATH)) return [];
  const parsed = JSON.parse(fs.readFileSync(BRIDGE_PATH, "utf8")) as { records?: ApprovedPublicOption[] };
  const staged = stagedCanaryIds();
  return (parsed.records || []).filter(record => isApproved(record, staged));
}

export function loadApprovedPublicOptions(publicRoute: string): ApprovedPublicOption[] {
  return allRecords()
    .filter(record => record.public_route === publicRoute)
    .sort((a, b) => a.display_title.localeCompare(b.display_title) || a.public_option_id.localeCompare(b.public_option_id));
}

export function findApprovedPublicOptionByInventoryId(inventoryId: string): ApprovedPublicOption | null {
  return allRecords().find(record => record.kk_id_or_delivery_object_id === inventoryId) || null;
}
