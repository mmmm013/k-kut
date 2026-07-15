import fs from "node:fs";
import path from "node:path";

export type ApprovedPublicOption = {
  public_option_id: string;
  source_pix_id_or_track_id: string;
  kk_id_or_delivery_object_id: string;
  display_title: string;
  interpretation_summary: string;
  action_object_meaning?: {
    verb?: string;
    object?: string;
    situation?: string;
  };
  intent_lane: string;
  approval_status: string;
  audio_delivery_url: string;
  audio_proof_status: string;
  payment_allowed: boolean;
  stripe_url_if_payment_allowed: string;
  public_route: string;
};

const BRIDGE_PATH = path.join(
  process.cwd(),
  "data",
  "publication-bridge",
  "public-option-records.generated.json"
);

const APPROVED_PUBLICATION_STATUSES = new Set([
  "public_approved_from_mial",
  "public_approved_generated_from_reusable_ii",
]);

function isApproved(record: ApprovedPublicOption): boolean {
  return Boolean(
    APPROVED_PUBLICATION_STATUSES.has(record.approval_status) &&
      record.audio_proof_status === "pass" &&
      record.payment_allowed === true &&
      record.audio_delivery_url?.startsWith("/") &&
      record.stripe_url_if_payment_allowed?.startsWith("https://buy.stripe.com/") &&
      record.public_route?.startsWith("/") &&
      record.display_title?.trim() &&
      record.interpretation_summary?.trim()
  );
}

export function loadApprovedPublicOptions(publicRoute: string): ApprovedPublicOption[] {
  if (!fs.existsSync(BRIDGE_PATH)) return [];

  const parsed = JSON.parse(fs.readFileSync(BRIDGE_PATH, "utf8")) as {
    records?: ApprovedPublicOption[];
  };

  return (parsed.records || [])
    .filter(isApproved)
    .filter((record) => record.public_route === publicRoute)
    .sort((a, b) => {
      const titleCompare = a.display_title.localeCompare(b.display_title);
      if (titleCompare !== 0) return titleCompare;
      return a.public_option_id.localeCompare(b.public_option_id);
    });
}
