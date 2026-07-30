export const HUGZ_BOUNDARY_HOLD = {
  active: true,
  status: "STOP_LINE_TP_CC_REVALIDATION_REQUIRED",
  reason:
    "KK/KOMBO vocal boundaries must be revalidated from the authorized LT-PIX source before playback, checkout, delivery, or fulfillment.",
  publicMessage:
    "Music choices are temporarily held while every vocal start and ending is rechecked for a clean, complete song segment.",
  blockedActions: [
    "public_audio",
    "checkout",
    "delivery",
    "fulfillment",
  ],
} as const;
