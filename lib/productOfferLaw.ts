export const PRODUCT_OFFER_LAW = {
  HUG: {
    customerName: "HUG",
    packageCode: "hug",
    priceUsd: "7.99",
    priceCents: 799,
    canonicalIiKinds: ["KK", "KOMBO"] as const,
    discoveryContainer: "HUGz Card",
    classification: "CUSTOMER_PACKAGE",
    isIi: false,
    isMedia: false,
    replacesCanonicalIiIdentity: false,
    publicAcrossGpmDomains: true,
  },
  TUG: {
    customerName: "TUG",
    packageCode: "tug",
    priceUsd: "4.99",
    priceCents: 499,
    canonicalIiKinds: ["sK"] as const,
    discoveryContainer: null,
    classification: "CUSTOMER_PACKAGE",
    isIi: false,
    isMedia: false,
    replacesCanonicalIiIdentity: false,
    publicAcrossGpmDomains: true,
  },
  BUG: {
    customerName: "BUG",
    packageCode: "bug",
    priceUsd: "1.99",
    priceCents: 199,
    canonicalIiKinds: ["mK"] as const,
    allowedMkSources: ["TRM", "XCLM", "VSND"] as const,
    discoveryContainer: null,
    classification: "CUSTOMER_PACKAGE",
    isIi: false,
    isMedia: false,
    replacesCanonicalIiIdentity: false,
    publicAcrossGpmDomains: true,
  },
} as const;

export type CustomerPackageName = keyof typeof PRODUCT_OFFER_LAW;
export type CustomerOfferName = CustomerPackageName;
export type CustomerPackageCode =
  (typeof PRODUCT_OFFER_LAW)[CustomerPackageName]["packageCode"];
export type HugCanonicalIiKind =
  (typeof PRODUCT_OFFER_LAW.HUG.canonicalIiKinds)[number];
export type TugCanonicalIiKind =
  (typeof PRODUCT_OFFER_LAW.TUG.canonicalIiKinds)[number];
export type BugCanonicalIiKind =
  (typeof PRODUCT_OFFER_LAW.BUG.canonicalIiKinds)[number];
export type CanonicalPackageIiKind =
  | HugCanonicalIiKind
  | TugCanonicalIiKind
  | BugCanonicalIiKind;
export type BugAllowedSource =
  (typeof PRODUCT_OFFER_LAW.BUG.allowedMkSources)[number];

export const CUSTOMER_PACKAGE_NAMES = ["HUG", "TUG", "BUG"] as const;

export const CUSTOMER_PACKAGE_ONLY_LAW = {
  names: CUSTOMER_PACKAGE_NAMES,
  classification: "CUSTOMER_PACKAGE",
  appliesAcrossAllGpmDomains: true,
  packageNamesAreNeverIiIdentity: true,
  packageNamesAreNeverMediaIdentity: true,
  canonicalIiIdentityMustRemainVisibleInEvidence: true,
} as const;

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

export function packageForCanonicalIiKind(
  kind: CanonicalPackageIiKind,
): CustomerPackageName {
  if (kind === "KK" || kind === "KOMBO") return "HUG";
  if (kind === "sK") return "TUG";
  return "BUG";
}

export function formatUsd(priceUsd: string) {
  return `$${priceUsd}`;
}
