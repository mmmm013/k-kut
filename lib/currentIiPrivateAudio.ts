import manifest from "@/config/current-ii-private-audio.v1.json";

export type CurrentIiPrivateAudioRecord = (typeof manifest.records)[number];

export const currentIiPrivateAudio = {
  bucket: manifest.storage_bucket,
  signedUrlTtlSeconds: manifest.signed_url_ttl_seconds,
  customerPreviewSignedUrlTtlSeconds:
    manifest.customer_preview_signed_url_ttl_seconds,
  records: manifest.records,
} as const;

export function findCurrentIiPrivateAudio(
  iiId: string,
): CurrentIiPrivateAudioRecord | null {
  return manifest.records.find((record) => record.ii_id === iiId) || null;
}

export function currentIiOwnerReviewRecords() {
  return manifest.records.filter((record) => record.owner_review_enabled);
}
