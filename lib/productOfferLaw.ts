export const PRODUCT_OFFER_LAW = {
  HUG: {
    customerName: "HUG",
    priceUsd: "7.99",
    priceCents: 799,
    canonicalIiKinds: ["KK", "KOMBO"] as const,
    discoveryContainer: "HUGz Card",
  },
  TUG: {
    customerName: "TUG",
    priceUsd: "4.99",
    priceCents: 499,
    canonicalIiKinds: ["sK"] as const,
    discoveryContainer: null,
  },
  BUG: {
    customerName: "BUG",
    priceUsd: "1.99",
    priceCents: 199,
    canonicalIiKinds: ["mK"] as const,
    allowedMkSources: ["TRM", "XCLM", "VSND"] as const,
    totalTimedSends: 3,
    deliveryModes: ["REPEAT", "STORY_ARC"] as const,
    repeatMode: {
      sameExactBugEachSend: true,
      contentHashMustMatchAcrossSends: true,
    },
    storyArcMode: {
      distinctBugEachSend: true,
      relatedThemeRequired: true,
      sequenceRoles: ["HOOK", "BUILD", "PAYOFF"] as const,
      randomizedOnlyAtAssembly: true,
      sequencingAddOnCents: 99,
      totalPriceCents: 298,
    },
    packageLockedBeforeSendOne: true,
    billingCount: 1,
    discoveryContainer: null,
  },
} as const;

export type CustomerOfferName = keyof typeof PRODUCT_OFFER_LAW;
export type HugCanonicalIiKind =
  (typeof PRODUCT_OFFER_LAW.HUG.canonicalIiKinds)[number];
export type BugAllowedSource =
  (typeof PRODUCT_OFFER_LAW.BUG.allowedMkSources)[number];

export const HUGZ_CARD_RULES = {
  count: 13,
  customerName: "HUGz Card",
  isIi: false,
  isMedia: false,
  isPurchasedProduct: false,
  housesOnly: PRODUCT_OFFER_LAW.HUG.canonicalIiKinds,
  optionsVisibleAtOnce: 3,
  priceUsd: PRODUCT_OFFER_LAW.HUG.priceUsd,
  priceCents: PRODUCT_OFFER_LAW.HUG.priceCents,
} as const;

export function formatUsd(priceUsd: string) {
  return `$${priceUsd}`;
}
