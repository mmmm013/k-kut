import sympathyRegistry from "@/data/intent-approved/sympathy-registry.json";

export type ApprovedIntentRow = {
  id: string;
  title: string;
  source_pix: string;
  section_context: string;
  ii_delivery_audio_url: string;
  intent: string;
  forbidden_intent_absent: string[];
  human_approved: boolean;
  audio_delivery_safe: boolean;
  buyer_copy_safe: boolean;
  receiver_risk_reviewed: boolean;
  payment_allowed: boolean;
  sampling_status: "PASS" | "HOLD" | "FAIL" | "REPROCESS";
  sampling_notes?: string;
  checkout_url?: string;
};

export type IntentRegistry = {
  status: string;
  intent: string;
  publication_allowed: boolean;
  rule: string;
  required_fields_for_future_rows: string[];
  rows: ApprovedIntentRow[];
};

const registries: Record<string, IntentRegistry> = {
  sympathy: sympathyRegistry as IntentRegistry,
  grief: sympathyRegistry as IntentRegistry,
  memorial: sympathyRegistry as IntentRegistry,
  "celebration-of-life": sympathyRegistry as IntentRegistry,
};

export function getApprovedIntentRegistry(slug: string): IntentRegistry | null {
  return registries[slug] ?? null;
}

export function getPublishableIntentRows(slug: string): ApprovedIntentRow[] {
  const registry = getApprovedIntentRegistry(slug);

  if (!registry || registry.publication_allowed !== true) {
    return [];
  }

  return (registry.rows || []).filter((row) => {
    return (
      row.human_approved === true &&
      row.audio_delivery_safe === true &&
      row.buyer_copy_safe === true &&
      row.receiver_risk_reviewed === true &&
      row.payment_allowed === true &&
      row.sampling_status === "PASS" &&
      Boolean(row.ii_delivery_audio_url) &&
      Boolean(row.checkout_url)
    );
  });
}
