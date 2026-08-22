/**
 * Canonical mirror of KKR_CANONICAL_PRODUCT_PRICE_LOCK_V002.
 *
 * V002 supersedes V001 by explicit GD decision on 2026-08-22.
 * Silent edits are prohibited; any amendment requires a new numbered lock.
 */
export const KKR_CANONICAL_PRICING_USD_CENTS = Object.freeze({
  HUG: 799,
  TUG: 499,
  BUG: 199,
} as const);

export const KKR_DELIVERY_LAW = Object.freeze({
  BUG_TOTAL_TIMED_SENDS: 3,
} as const);
