import {
  CUSTOMER_PACKAGE_NAMES,
  PRODUCT_OFFER_LAW,
  type CanonicalPackageIiKind,
  type CustomerPackageName,
} from "@/lib/productOfferLaw";

export type GpmPlatformId = "gpmx" | "sentimeants" | "13hugz" | "k-kut";
export type GpmExperienceLens =
  | "general"
  | "personal"
  | "holiday"
  | "themes"
  | "kupid"
  | "wedding";

export const CROSS_DOMAIN_PACKAGE_DP_VERSION =
  "GPMX_CROSS_DOMAIN_PACKAGE_DP_V002";

// Compatibility name retained while the governing scope expands from HUG-only
// to all three customer packages.
export const CROSS_DOMAIN_HUG_DP_VERSION = CROSS_DOMAIN_PACKAGE_DP_VERSION;

export const CANONICAL_CUSTOMER_PACKAGES = {
  HUG: PRODUCT_OFFER_LAW.HUG,
  TUG: PRODUCT_OFFER_LAW.TUG,
  BUG: PRODUCT_OFFER_LAW.BUG,
} as const;

export const CANONICAL_HUG_IDENTITY = {
  ...PRODUCT_OFFER_LAW.HUG,
  neverRenameByPlatform: true,
} as const;

export const CROSS_DOMAIN_PACKAGE_ONLY_LAW = {
  allowedCustomerPackageNames: CUSTOMER_PACKAGE_NAMES,
  namesApplyAcrossEveryGpmDomain: true,
  packageNamesAreNeverIiIdentity: true,
  packageNamesAreNeverMediaIdentity: true,
  canonicalIiIdentityRemainsSeparate: true,
  mapping: {
    HUG: ["KK", "KOMBO"],
    TUG: ["sK"],
    BUG: ["mK"],
  },
  bugAllowedSources: PRODUCT_OFFER_LAW.BUG.allowedMkSources,
} as const;

export const GPM_PLATFORM_ROLES = {
  gpmx: {
    id: "gpmx",
    displayName: "GPMx",
    hosts: ["gputnammusic.com", "www.gputnammusic.com"] as const,
    uniquePurpose:
      "Governing platform, source/catalog authority, rights context, and matching intelligence.",
    customerExperience:
      "Discover which governed HUG, TUG, or BUG direction may serve the need without changing the underlying II identity.",
    primaryActionLabel: "Discover a package",
    checkoutAuthority: false,
    deliveryAuthority: false,
    bfProfile: "gpmx",
  },
  sentimeants: {
    id: "sentimeants",
    displayName: "Sent-i-Meants",
    hosts: [
      "sentimeant.com",
      "www.sentimeant.com",
      "sentimeants.com",
      "www.sentimeants.com",
    ] as const,
    uniquePurpose:
      "Human-meaning front door: user expression, The Mirror, MC-BOT clarification, and two-sided MGS comparison.",
    customerExperience:
      "Say what happened, confirm what was understood, and refine the need before a HUG, TUG, or BUG is recommended.",
    primaryActionLabel: "Send what you meant",
    checkoutAuthority: false,
    deliveryAuthority: false,
    bfProfile: "sentimeants",
  },
  "13hugz": {
    id: "13hugz",
    displayName: "13HUGz",
    hosts: ["13hugz.com", "www.13hugz.com"] as const,
    uniquePurpose:
      "Visual HUGz Card discovery and promotion across thirteen sentiment containers.",
    customerExperience:
      "Browse a HUGz Card, compare its direction, then tell MC-BOT what the sender actually means. HUGz Cards house HUG choices only.",
    primaryActionLabel: "Choose a HUGz Card",
    checkoutAuthority: false,
    deliveryAuthority: false,
    bfProfile: "13hugz",
  },
  "k-kut": {
    id: "k-kut",
    displayName: "K-KUT",
    hosts: ["k-kut.com", "www.k-kut.com"] as const,
    uniquePurpose:
      "Exact-II package selection, governed checkout, fulfillment, private delivery, and support.",
    customerExperience:
      "Choose the exact governed HUG, TUG, or BUG, buy it, send it, and receive the correct delivery.",
    primaryActionLabel: "Choose and send this package",
    checkoutAuthority: true,
    deliveryAuthority: true,
    bfProfile: "k-kut",
  },
} as const;

export const GPM_EXPERIENCE_LENSES: Record<
  GpmExperienceLens,
  { displayName: string; purpose: string }
> = {
  general: {
    displayName: "General",
    purpose:
      "Open package discovery without assuming a relationship or occasion.",
  },
  personal: {
    displayName: "Personal",
    purpose: "Relationship-led package discovery for a particular person.",
  },
  holiday: {
    displayName: "Holiday",
    purpose: "Holiday context without changing the package or II identity.",
  },
  themes: {
    displayName: "Themes",
    purpose: "Need-, emotion-, mood-, sentiment-, and effect-led discovery.",
  },
  kupid: {
    displayName: "Kupid",
    purpose:
      "Romantic relationship lens; the customer package remains HUG, TUG, or BUG.",
  },
  wedding: {
    displayName: "Wedding",
    purpose:
      "Wedding occasion lens; the customer package remains HUG, TUG, or BUG.",
  },
};

export const CROSS_DOMAIN_PACKAGE_DP_STAGES = [
  "USER_EXPRESSION",
  "MC_BOT_REFLECTION",
  "USER_CONFIRMATION",
  "TWO_SIDED_MGS_COMPARISON",
  "THREE_EXPLAINED_CANDIDATES",
  "USER_REFINEMENT_OR_REJECTION",
  "EXACT_II_SELECTION",
  "CUSTOMER_PACKAGE_ASSIGNMENT",
  "K_KUT_GOVERNED_CHECKOUT",
  "K_KUT_PRIVATE_DELIVERY",
  "ORIGIN_ATTRIBUTION_RETAINED",
] as const;

export const CROSS_DOMAIN_HUG_DP_STAGES = CROSS_DOMAIN_PACKAGE_DP_STAGES;

export const CROSS_DOMAIN_PACKAGE_HANDOFF_FIELDS = [
  "dpVersion",
  "originDomain",
  "originPlatform",
  "originExperience",
  "exactUserWords",
  "relationship",
  "pointOfView",
  "desiredEffect",
  "emotion",
  "mood",
  "sentiment",
  "intensity",
  "positiveRequirements",
  "exclusions",
  "mgsTerms",
  "selectedTheme",
  "candidateInventoryId",
  "canonicalIiKind",
  "customerPackageName",
  "evidenceStatus",
] as const;

export const CROSS_DOMAIN_HUG_HANDOFF_FIELDS =
  CROSS_DOMAIN_PACKAGE_HANDOFF_FIELDS;

export type CrossDomainPackageHandoff = {
  dpVersion: typeof CROSS_DOMAIN_PACKAGE_DP_VERSION;
  originDomain: string;
  originPlatform: GpmPlatformId;
  originExperience: GpmExperienceLens;
  exactUserWords: string;
  relationship: string;
  pointOfView: string;
  desiredEffect: string;
  emotion: string;
  mood: string;
  sentiment: string;
  intensity: string;
  positiveRequirements: string[];
  exclusions: string[];
  mgsTerms: string[];
  selectedTheme: string;
  candidateInventoryId: string;
  canonicalIiKind: CanonicalPackageIiKind | "";
  customerPackageName: CustomerPackageName | "";
  evidenceStatus: "UNPROVEN" | "CANDIDATE" | "APPROVED" | "NO_THEME_FIT_HOLD";
};

export type CrossDomainHugHandoff = CrossDomainPackageHandoff;

function normalizeHost(value: string) {
  return value
    .split(",")[0]
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//u, "")
    .replace(/:\d+$/u, "")
    .replace(/\/$/u, "");
}

export function platformForHost(value: string) {
  const host = normalizeHost(value);

  for (const platform of Object.values(GPM_PLATFORM_ROLES)) {
    if ((platform.hosts as readonly string[]).includes(host)) return platform;
  }

  return GPM_PLATFORM_ROLES["k-kut"];
}

export function bfProfileForHost(value: string) {
  return platformForHost(value).bfProfile;
}

export function sentimeantStartHrefFromHugzCard(cardSlug: string) {
  const params = new URLSearchParams({
    source: GPM_PLATFORM_ROLES["13hugz"].id,
    card: cardSlug,
    package: "HUG",
  });
  return `/sentimeant/start?${params.toString()}`;
}

export function createEmptyCrossDomainPackageHandoff(input: {
  originDomain: string;
  originExperience?: GpmExperienceLens;
  exactUserWords?: string;
  customerPackageName?: CustomerPackageName;
}): CrossDomainPackageHandoff {
  const platform = platformForHost(input.originDomain);

  return {
    dpVersion: CROSS_DOMAIN_PACKAGE_DP_VERSION,
    originDomain: normalizeHost(input.originDomain),
    originPlatform: platform.id,
    originExperience: input.originExperience || "general",
    exactUserWords: input.exactUserWords?.trim() || "",
    relationship: "",
    pointOfView: "",
    desiredEffect: "",
    emotion: "",
    mood: "",
    sentiment: "",
    intensity: "",
    positiveRequirements: [],
    exclusions: [],
    mgsTerms: [],
    selectedTheme: "",
    candidateInventoryId: "",
    canonicalIiKind: "",
    customerPackageName: input.customerPackageName || "",
    evidenceStatus: "UNPROVEN",
  };
}

export const createEmptyCrossDomainHugHandoff =
  createEmptyCrossDomainPackageHandoff;
