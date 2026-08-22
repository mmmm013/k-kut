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

export const KKR_CANONICAL_ADDONS_USD_CENTS = Object.freeze({
    STORY_BUG_SEQUENCING: 99,
  } as const);

  export const KKR_CANONICAL_PACKAGE_TOTALS_USD_CENTS = Object.freeze({
    REPEAT_BUG: 199,
    STORY_BUG: 298,
  } as const);

  export const KKR_DELIVERY_LAW = Object.freeze({
  BUG_TOTAL_TIMED_SENDS: 3,
    BUG_DELIVERY_MODES: ["REPEAT", "STORY_ARC"],
    REPEAT_BUG_SAME_EXACT_BUG_EACH_SEND: true,
    REPEAT_BUG_CONTENT_HASH_MUST_MATCH_ACROSS_SENDS: true,
    STORY_BUG_DISTINCT_BUG_EACH_SEND: true,
    STORY_BUG_RELATED_THEME_REQUIRED: true,
    STORY_BUG_SEQUENCE_ROLES: ["HOOK", "BUILD", "PAYOFF"],
    STORY_BUG_RANDOMIZED_ONLY_AT_ASSEMBLY: true,
    STORY_BUG_SEQUENCING_ADDON_CENTS: 99,
    STORY_BUG_TOTAL_CENTS: 298,
    BUG_PACKAGE_LOCKED_BEFORE_SEND_ONE: true,
    BUG_BILLING_COUNT: 1,
} as const);
