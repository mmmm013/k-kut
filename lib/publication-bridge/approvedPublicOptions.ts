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

type ProvedFamilyItem = {
  ii_key?: string;
  display_title?: string;
  buyer_intent?: string;
  audio_url?: string;
  price_usd?: string;
  llbp_state?: string;
  boundary_prosecution_state?: string;
};

type ProvedFamilyManifest = {
  status?: string;
  source_title?: string;
  source_catalog_track_id?: string | number;
  source_audio_unchanged?: boolean;
  theme?: string;
  counts?: { hug?: number; tug?: number; bug?: number };
  hugs?: ProvedFamilyItem[];
  tugs?: ProvedFamilyItem[];
  bugs?: ProvedFamilyItem[];
};

const BRIDGE_PATH = path.join(process.cwd(), "data", "publication-bridge", "public-option-records.generated.json");
const CANARY_PATH = path.join(process.cwd(), "data", "production", "first-production-canary-v1.json");
const COMIN_TRUE_PATH = path.join(process.cwd(), "data", "ii-delivery-registry", "comin-true-full-family-v1.json");

const APPROVED_PUBLICATION_STATUSES = new Set([
  "public_approved_from_mial",
  "public_approved_generated_from_reusable_ii",
]);

// Universal audio-boundary law: every governed II, including KK/HUG, must stop
// exactly at the last audible vocal note (last audible vocal-note END). No post-vocal tail and no
// entry into the next InTP/VTP pair. Old trim timestamps are not authority.
const STRICT_BOUNDARY_PASS = "STRICT_LAST_VOCAL_NOTE_END_PASS";

function stagedCanaryRecords(): Map<string, CanaryRecord> {
  if (!fs.existsSync(CANARY_PATH)) return new Map();
  const parsed = JSON.parse(fs.readFileSync(CANARY_PATH, "utf8")) as { records?: CanaryRecord[] };
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

function isApproved(record: ApprovedPublicOption, staged: Map<string, CanaryRecord>): boolean {
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

function exactPriceCents(value: string | undefined, expected: 799 | 499 | 199) {
  const normalized = String(value || "").trim();
  const expectedUsd = (expected / 100).toFixed(2);
  return normalized === expectedUsd ? expected : null;
}

function provedFamilyRecords(): ApprovedPublicOption[] {
  if (!fs.existsSync(COMIN_TRUE_PATH)) return [];
  const manifest = JSON.parse(fs.readFileSync(COMIN_TRUE_PATH, "utf8")) as ProvedFamilyManifest;
  if (manifest.status !== "PUBLIC_READY_COMPLETE_FAMILY" || manifest.source_audio_unchanged !== true) return [];

  const families = [
    { items: manifest.hugs || [], product: "HUG" as const, inventory: "KK" as const, price: 799 as const, count: manifest.counts?.hug },
    { items: manifest.tugs || [], product: "TUG" as const, inventory: "SK" as const, price: 499 as const, count: manifest.counts?.tug },
    { items: manifest.bugs || [], product: "BUG" as const, inventory: "MK" as const, price: 199 as const, count: manifest.counts?.bug },
  ];

  if (families.some((family) => family.count !== family.items.length)) return [];
  const sourceId = String(manifest.source_catalog_track_id || "comin_true");
  const intentLane = String(manifest.theme || "Motivation");
  const records: ApprovedPublicOption[] = [];

  for (const family of families) {
    for (const item of family.items) {
      const iiKey = String(item.ii_key || "").trim();
      const displayTitle = String(item.display_title || "").trim();
      const interpretation = String(item.buyer_intent || "").trim();
      const audioUrl = String(item.audio_url || "").trim();
      const priceCents = exactPriceCents(item.price_usd, family.price);
      const strictBoundaryPassed = item.boundary_prosecution_state === STRICT_BOUNDARY_PASS;

      if (!/^[A-Za-z0-9_-]{1,200}$/.test(iiKey) || !displayTitle || !interpretation || !audioUrl.startsWith("/") || item.llbp_state !== "PUBLIC_PASS" || !strictBoundaryPassed || priceCents === null) continue;

      records.push({
        public_option_id: `public_comin_true_${iiKey}`,
        source_pix_id_or_track_id: sourceId,
        kk_id_or_delivery_object_id: iiKey,
        product_family: family.product,
        inventory_family: family.inventory,
        price_cents: priceCents,
        display_title: displayTitle,
        interpretation_summary: interpretation,
        intent_lane: intentLane,
        approval_status: "public_approved_generated_from_reusable_ii",
        audio_delivery_url: audioUrl,
        audio_proof_status: "pass",
        payment_allowed: true,
        stripe_url_if_payment_allowed: "",
        public_route: "/hugs/comin-true",
      });
    }
  }
  return records;
}

function generatedBridgeRecords(): ApprovedPublicOption[] {
  if (!fs.existsSync(BRIDGE_PATH)) return [];
  const parsed = JSON.parse(fs.readFileSync(BRIDGE_PATH, "utf8")) as { records?: ApprovedPublicOption[] };
  const staged = stagedCanaryRecords();
  return (parsed.records || []).filter((record) => isApproved(record, staged));
}

function allRecords(): ApprovedPublicOption[] {
  const byPublicOptionId = new Map<string, ApprovedPublicOption>();
  for (const record of [...generatedBridgeRecords(), ...provedFamilyRecords()]) byPublicOptionId.set(record.public_option_id, record);
  return [...byPublicOptionId.values()];
}

export function loadAllApprovedPublicOptions(): ApprovedPublicOption[] { return allRecords(); }
export function loadApprovedPublicOptions(publicRoute: string): ApprovedPublicOption[] {
  return allRecords().filter(record => record.public_route === publicRoute).sort((a, b) => a.display_title.localeCompare(b.display_title) || a.public_option_id.localeCompare(b.public_option_id));
}
export function findApprovedPublicOptionByInventoryId(inventoryId: string): ApprovedPublicOption | null { return allRecords().find(record => record.kk_id_or_delivery_object_id === inventoryId) || null; }
export function findApprovedPublicOptionByPublicOptionId(publicOptionId: string): ApprovedPublicOption | null { return allRecords().find(record => record.public_option_id === publicOptionId) || null; }
export function findApprovedPublicOptionByAnyId(id: string): ApprovedPublicOption | null { return allRecords().find(record => record.kk_id_or_delivery_object_id === id || record.public_option_id === id) || null; }
export function currentIiAuthoritySummary() {
  const records = allRecords();
  return { status: records.length > 0 ? "CURRENT_II_STAGE_ACTIVE" : "CURRENT_II_HOLD", authorizedIiCount: new Set(records.map((record) => record.kk_id_or_delivery_object_id)).size, authorizedPublicOptionCount: records.length } as const;
}
