import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");
const stop = (message) => {
  throw new Error(message);
};

const contract = read("lib/crossDomainHugDp.ts");
const offerLaw = read("lib/productOfferLaw.ts");
const governance = read("docs/site-governance/GPMX_CROSS_DOMAIN_HUG_DP_V001.md");
const layout = read("app/layout.tsx");
const hugzLanding = read("components/HugzRotatingLanding.tsx");
const sentimeantStart = read("app/sentimeant/start/page.tsx");
const checkout = read("app/checkout/route.ts");
const pendingOrder = read("lib/h2PendingOrder.ts");

for (const required of [
  'customerName: "HUG"',
  'canonicalIiKinds: ["KK", "KOMBO"]',
  'customerName: "HUGz Card"',
  "isIi: false",
  "isMedia: false",
  "isPurchasedProduct: false",
]) {
  if (!offerLaw.includes(required)) {
    stop(`canonical HUG offer law missing: ${required}`);
  }
}

for (const required of [
  'CROSS_DOMAIN_HUG_DP_VERSION = "GPMX_CROSS_DOMAIN_HUG_DP_V001"',
  "neverRenameByPlatform: true",
  'id: "gpmx"',
  'id: "sentimeants"',
  'id: "13hugz"',
  'id: "k-kut"',
  "checkoutAuthority: true",
  "deliveryAuthority: true",
  '"USER_EXPRESSION"',
  '"MC_BOT_REFLECTION"',
  '"USER_CONFIRMATION"',
  '"TWO_SIDED_MGS_COMPARISON"',
  '"THREE_EXPLAINED_CANDIDATES"',
  '"USER_REFINEMENT_OR_REJECTION"',
  '"EXACT_II_SELECTION"',
  '"K_KUT_GOVERNED_CHECKOUT"',
  '"K_KUT_PRIVATE_DELIVERY"',
  '"ORIGIN_ATTRIBUTION_RETAINED"',
  '"exactUserWords"',
  '"positiveRequirements"',
  '"exclusions"',
  '"mgsTerms"',
  '"candidateInventoryId"',
  '"NO_THEME_FIT_HOLD"',
]) {
  if (!contract.includes(required)) {
    stop(`cross-domain HUG DP contract missing: ${required}`);
  }
}

const checkoutAuthorityCount = (
  contract.match(/checkoutAuthority: true/g) || []
).length;
const deliveryAuthorityCount = (
  contract.match(/deliveryAuthority: true/g) || []
).length;

if (checkoutAuthorityCount !== 1 || deliveryAuthorityCount !== 1) {
  stop("K-KUT must be the only checkout and delivery authority");
}

for (const required of [
  "A purchased HUG remains **HUG** across every GPM domain and experience.",
  "A selected HUGz Card is a starting clue, not a final theme decision",
  "MC-BOT/no-music recordings are never KK, KOMBO, sK, mK, or any II.",
  "NO THEME FIT — HOLD",
  "K-KUT is the only checkout and delivery authority",
  "Origin-domain attribution must survive",
]) {
  if (!governance.includes(required)) {
    stop(`governance missing: ${required}`);
  }
}

if (!layout.includes('platformForHost')) {
  stop("layout does not use shared platform-role authority");
}

for (const required of [
  "GpmxHeader",
  "SentimeantHeader",
  "KkutHeader",
  'platform.id === "13hugz"',
  'platform.id === "sentimeants"',
  'platform.id === "gpmx"',
]) {
  if (!layout.includes(required)) {
    stop(`platform-specific customer experience missing: ${required}`);
  }
}

for (const required of [
  "sentimeantStartHrefFromHugzCard",
  "Tell MC-BOT what you mean",
  "Open this HUGz Card",
]) {
  if (!hugzLanding.includes(required)) {
    stop(`13HUGz handoff missing: ${required}`);
  }
}

if (hugzLanding.includes('href={`/hugz/${active.slug}`}') && hugzLanding.includes("Start a New Sentimeant")) {
  stop("13HUGz still labels its own card route as a Sentimeant start");
}

for (const required of [
  "params.source",
  "params.card",
  "starting clue, not a decision",
  "13HUGz",
]) {
  if (!sentimeantStart.includes(required)) {
    stop(`Sent-i-Meants cross-domain context missing: ${required}`);
  }
}

for (const required of [
  'import { bfProfileForHost } from "@/lib/crossDomainHugDp"',
  "const checkoutOriginDomain = originDomain(request)",
  "const bfProfile = bfProfileForHost(checkoutOriginDomain)",
  "originDomain: checkoutOriginDomain",
  "bfProfile,",
  'checkoutUrl.searchParams.set("utm_source", bfProfile)',
]) {
  if (!checkout.includes(required)) {
    stop(`checkout attribution enforcement missing: ${required}`);
  }
}

for (const required of [
  "origin_domain",
  "bf_profile",
  "public_product_name",
  'core_offer_code: "hug"',
]) {
  if (!pendingOrder.includes(required)) {
    stop(`pending-order handoff evidence missing: ${required}`);
  }
}

console.log("CROSS-DOMAIN HUG DP V001 AUDIT: PASS");
console.log("CANONICAL CUSTOMER PRODUCT: HUG");
console.log("CANONICAL MUSIC IDENTITY: KK OR KOMBO");
console.log("PLATFORM ROLES: DISTINCT");
console.log("CHECKOUT AUTHORITY: K-KUT ONLY");
console.log("DELIVERY AUTHORITY: K-KUT ONLY");
console.log("ORIGIN ATTRIBUTION: REQUIRED");
