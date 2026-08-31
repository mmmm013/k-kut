import manifest from "@/data/production/gregory-approved-kk-subset-v1.json";

export type ApprovedIiContainer = "regular_hug" | "holiday_hug";

type ManifestItem = {
  batch_item_id: number;
  moment_number: number;
  section_label: string;
  section_role: string;
  storage_object_path: string;
};

type ManifestTitle = {
  source_title: string;
  public_title: string;
  container: ApprovedIiContainer;
  intent_lane: string;
  interpretation_summary: string;
  items: ManifestItem[];
};

export type ApprovedIiReleaseItem = {
  batchItemId: number;
  publicOptionId: string;
  publicTitle: string;
  sourceTitle: string;
  momentNumber: number;
  sectionLabel: string;
  sectionRole: string;
  storageBucket: string;
  storageObjectPath: string;
  container: ApprovedIiContainer;
  productFamily: "HUG";
  inventoryFamily: "KK";
  priceCents: 799 | 1499;
  intentLane: string;
  interpretationSummary: string;
  audioDeliveryUrl: string;
};

const titles = manifest.titles as ManifestTitle[];

export const approvedIiRelease = {
  schemaVersion: manifest.schema_version,
  signedUrlTtlSeconds: manifest.signed_url_ttl_seconds,
  records: titles.flatMap((title) =>
    title.items.map((item): ApprovedIiReleaseItem => {
      const publicOptionId = `gkk-${item.batch_item_id}`;
      const priceCents =
        title.container === "holiday_hug"
          ? manifest.prices_cents.holiday_hug
          : manifest.prices_cents.regular_hug;

      return {
        batchItemId: item.batch_item_id,
        publicOptionId,
        publicTitle: title.public_title,
        sourceTitle: title.source_title,
        momentNumber: item.moment_number,
        sectionLabel: item.section_label,
        sectionRole: item.section_role,
        storageBucket: manifest.storage_bucket,
        storageObjectPath: item.storage_object_path,
        container: title.container,
        productFamily: "HUG",
        inventoryFamily: "KK",
        priceCents: priceCents as 799 | 1499,
        intentLane: title.intent_lane,
        interpretationSummary: title.interpretation_summary,
        audioDeliveryUrl: `/api/approved-ii-audio/${publicOptionId}`,
      };
    }),
  ),
} as const;

export function loadApprovedIiRelease(): ApprovedIiReleaseItem[] {
  return [...approvedIiRelease.records];
}

export function findApprovedIiReleaseByPublicOptionId(
  publicOptionId: string,
): ApprovedIiReleaseItem | null {
  return (
    approvedIiRelease.records.find(
      (record) => record.publicOptionId === publicOptionId,
    ) || null
  );
}

export function approvedIiCheckoutConfigured(
  container: ApprovedIiContainer,
): boolean {
  const value =
    container === "holiday_hug"
      ? process.env.K_KUT_HOLIDAY_HUG_STRIPE_PAYMENT_LINK
      : process.env.K_KUT_REGULAR_HUG_STRIPE_PAYMENT_LINK;

  try {
    const url = new URL(String(value || "").trim());
    return url.protocol === "https:" && url.hostname === "buy.stripe.com";
  } catch {
    return false;
  }
}
