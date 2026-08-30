import fs from "node:fs";
import path from "node:path";

export type ApprovedPublicOption = {
  public_option_id: string;
  source_pix_id_or_track_id: string;
  kk_id_or_delivery_object_id: string;
  product_family: "HUG" | "TUG" | "BUG";
  inventory_family: "KK" | "SK" | "MK";
  price_cents: 799 | 499 | 199;
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

type CanaryRecord = {
  ii_id?: string;
  status?: string;
  product_family?: ApprovedPublicOption["product_family"];
  inventory_family?: ApprovedPublicOption["inventory_family"];
  price_cents?: ApprovedPublicOption["price_cents"];
  missing_current_proof?: string[];
};

const BRIDGE_PATH = path.join(process.cwd(), "data", "publication-bridge", "public-option-records.generated.json");
const CANARY_PATH = path.join(process.cwd(), "data", "production", "first-production-canary-v1.json");

const APPROVED_PUBLICATION_STATUSES = new Set([
  "public_approved_from_mial",
  "public_approved_generated_from_reusable_ii",
]);

function stagedCanaryRecords(): Map<string, CanaryRecord> {
  if (!fs.existsSync(CANARY_PATH)) return new Map();
  const parsed = JSON.parse(fs.readFileSync(CANARY_PATH, "utf8")) as {
    records?: CanaryRecord[];
  };
  return new Map(
    (parsed.records || [])
      .filter(
        (record) =>
          record.status === "STAGE" &&
          record.ii_id &&
          (record.missing_current_proof?.length || 0) === 0,
      )
      .map((record) => [record.ii_id as string, record]),
  );
}

function isApproved(
  record: ApprovedPublicOption,
  staged: Map<string, CanaryRecord>,
): boolean {
  const canary = staged.get(record.kk_id_or_delivery_object_id);

  return Boolean(
    canary &&
      canary.product_family === record.product_family &&
      canary.inventory_family === record.inventory_family &&
      canary.price_cents === record.price_cents &&
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
  const staged = stagedCanaryRecords();
  return (parsed.records || []).filter(record => isApproved(record, staged));
}

export function loadAllApprovedPublicOptions(): ApprovedPublicOption[] {
  return allRecords();
}

export function loadApprovedPublicOptions(publicRoute: string): ApprovedPublicOption[] {
  return allRecords()
    .filter(record => record.public_route === publicRoute)
    .sort((a, b) => a.display_title.localeCompare(b.display_title) || a.public_option_id.localeCompare(b.public_option_id));
}

export function findApprovedPublicOptionByInventoryId(inventoryId: string): ApprovedPublicOption | null {
  return allRecords().find(record => record.kk_id_or_delivery_object_id === inventoryId) || null;
}

export function findApprovedPublicOptionByPublicOptionId(publicOptionId: string): ApprovedPublicOption | null {
  return allRecords().find(record => record.public_option_id === publicOptionId) || null;
}

export function findApprovedPublicOptionByAnyId(id: string): ApprovedPublicOption | null {
  return (
    allRecords().find(
      (record) =>
        record.kk_id_or_delivery_object_id === id ||
        record.public_option_id === id,
    ) || null
  );
}

export function currentIiAuthoritySummary() {
  const records = allRecords();

  return {
    status: records.length > 0 ? "CURRENT_II_STAGE_ACTIVE" : "CURRENT_II_HOLD",
    authorizedIiCount: new Set(
      records.map((record) => record.kk_id_or_delivery_object_id),
    ).size,
    authorizedPublicOptionCount: records.length,
  } as const;
}
