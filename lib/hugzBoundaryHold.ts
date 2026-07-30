export const HUGZ_BOUNDARY_HOLD = {
  active: true,
  status: "STOP_LINE_TP_CC_REVALIDATION_REQUIRED",
  reason:
    "KK/KOMBO vocal boundaries must be revalidated from the authorized LT-PIX source before public playback, delivery, or fulfillment.",
  publicMessage:
    "Audio previews are temporarily held while every vocal start and ending is rechecked. Verified HUG inventory remains available for purchase at $7.99.",
  blockedActions: [
    "public_audio",
    "delivery",
    "fulfillment",
  ],
} as const;
