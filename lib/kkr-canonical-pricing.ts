/**
 * Canonical mirror of:
 * GPMC/docs/4pe-biz-msc/KKR_CANONICAL_PRODUCT_PRICE_LOCK_V001.md
 *
 * An amendment requires an explicit GD decision and a new numbered
 * lock version. Silent edits are prohibited.
 */
export const KKR_CANONICAL_PRICING_USD_CENTS = Object.freeze({
  VOCAL_NOTE_OR_TYPED_MESSAGE_ADDON: 99,
  mKUT: 199,
  sBLK: 499,
  BLK: 799,
  PROMOTIONAL_HUG: 1199,
  STANDARD_HUG: 1499,
} as const);

export const KKR_STRUCTURAL_LAW = Object.freeze({
  sBLK:
    'One identified structural segment of a BLK, such as Verse 1a, Verse 1b, Verse 2a, or Verse 2b.',
  mKUT_is_sBLK: false,
} as const);
