export const HUGZ_BOUNDARY_HOLD = {
  active: true,
  status: "STOP_LINE_TP_CC_REVALIDATION_REQUIRED",
  reason:
    "Exact music titles and vocal boundaries must be revalidated from the authorized source before public playback, checkout, delivery, or fulfillment.",
  publicMessage:
    "Exact music titles, audio previews, and checkout are temporarily held while every vocal start, ending, meaning, and delivery file is rechecked.",
  blockedActions: [
    "public_choice_titles",
    "public_audio",
    "checkout",
    "delivery",
    "fulfillment",
  ],
} as const;
