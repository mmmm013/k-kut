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
const webhook = read("app/api/stripe/webhook/route.ts");
const packageMigration = read(
  "supabase/migrations/20260801_expand_h2_customer_package_codes.sql",
);

for (const required of [
  'customerName: "HUG"',
  'packageCode: "hug"',
  'priceUsd: "7.99"',
  'canonicalIiKinds: ["KK", "KOMBO"]',
  'customerName: "TUG"',
  'packageCode: "tug"',
  'priceUsd: "4.99"',
  'canonicalIiKinds: ["sK"]',
  'customerName: "BUG"',
  'packageCode: "bug"',
  'priceUsd: "1.99"',
  'canonicalIiKinds: ["mK"]',
  'allowedMkSources: ["TRM", "XCLM", "VSND"]',
  'classification: "CUSTOMER_PACKAGE"',
  "isIi: false",
  "isMedia: false",
  "replacesCanonicalIiIdentity: false",
  "publicAcrossGpmDomains: true",
  'customerName: "HUGz Card"',
  "isPurchasedProduct: false",
  "housesOnly: PRODUCT_OFFER_LAW.HUG.canonicalIiKinds",
]) {
  if (!offerLaw.includes(required)) {
    stop(`canonical customer-package law missing: ${required}`);
  }
}

for (const required of [
  'CROSS_DOMAIN_PACKAGE_DP_VERSION =',
  '"GPMX_CROSS_DOMAIN_PACKAGE_DP_V002"',
  "CROSS_DOMAIN_PACKAGE_ONLY_LAW",
  'allowedCustomerPackageNames: CUSTOMER_PACKAGE_NAMES',
  "packageNamesAreNeverIiIdentity: true",
  "packageNamesAreNeverMediaIdentity: true",
  "canonicalIiIdentityRemainsSeparate: true",
  'HUG: ["KK", "KOMBO"]',
  'TUG: ["sK"]',
  'BUG: ["mK"]',
  'id: "gpmx"',
  'id: "sentimeants"',
  'id: "13hugz"',
  'id: "k-kut"',
  "checkoutAuthority: true",
  "deliveryAuthority: true",
  '"CUSTOMER_PACKAGE_ASSIGNMENT"',
  '"K_KUT_GOVERNED_CHECKOUT"',
  '"K_KUT_PRIVATE_DELIVERY"',
  '"ORIGIN_ATTRIBUTION_RETAINED"',
  '"exactUserWords"',
  '"candidateInventoryId"',
  '"canonicalIiKind"',
  '"customerPackageName"',
  '"NO_THEME_FIT_HOLD"',
  'package: "HUG"',
]) {
  if (!contract.includes(required)) {
    stop(`cross-domain package DP contract missing: ${required}`);
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
  "HUG, TUG, and BUG are customer package names only.",
  "HUG — $7.99",
  "TUG — $4.99",
  "BUG — $1.99",
  "The exact II identity must remain independently preserved",
  "HUGz Cards house HUG choices only",
  "NO THEME FIT — HOLD",
  "K-KUT is the only checkout and delivery authority",
  "Origin-domain attribution must survive",
  "BUG remains held from checkout",
]) {
  if (!governance.includes(required)) {
    stop(`governance missing: ${required}`);
  }
}

if (!layout.includes("platformForHost")) {
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

if (
  hugzLanding.includes('href={`/hugz/${active.slug}`}') &&
  hugzLanding.includes("Start a New Sentimeant")
) {
  stop("13HUGz still labels its own card route as a Sentimeant start");
}

for (const required of [
  "params.source",
  "params.card",
  "params.package",
  "CUSTOMER_PACKAGE_NAMES",
  "HUG is the customer package only",
  "KK or KOMBO",
  "HUG, TUG, and BUG remain customer package names only",
]) {
  if (!sentimeantStart.includes(required)) {
    stop(`Sent-i-Meants package handoff missing: ${required}`);
  }
}

for (const required of [
  'import { bfProfileForHost } from "@/lib/crossDomainHugDp"',
  "PRODUCT_OFFER_LAW.TUG.customerName",
  "PRODUCT_OFFER_LAW.HUG.customerName",
  "PRODUCT_OFFER_LAW.TUG.packageCode",
  "PRODUCT_OFFER_LAW.HUG.packageCode",
  "customerPackageCode: config.customerPackageCode",
  "const checkoutOriginDomain = originDomain(request)",
  "const bfProfile = bfProfileForHost(checkoutOriginDomain)",
  "originDomain: checkoutOriginDomain",
  'checkoutUrl.searchParams.set("utm_source", bfProfile)',
]) {
  if (!checkout.includes(required)) {
    stop(`checkout package enforcement missing: ${required}`);
  }
}

for (const forbidden of ["sK HUG", "KK HUG", "K-KUT HUG"]) {
  if (checkout.includes(forbidden)) {
    stop(`governed checkout uses forbidden mixed package label: ${forbidden}`);
  }
}

for (const required of [
  '"hug"',
  '"tug"',
  '"bug"',
  "customerPackageCode: CustomerPackageCode",
  "core_offer_code: customerPackageCode",
  "origin_domain",
  "bf_profile",
  "public_product_name",
]) {
  if (!pendingOrder.includes(required)) {
    stop(`pending-order package evidence missing: ${required}`);
  }
}

for (const required of [
  "customer_package_code",
  "selected_inventory_id",
  "pendingOrder.customerPackageCode",
  'product_family: "CUSTOMER_PACKAGE"',
  'personal_note_placement: "before_package_content"',
  'share_mode: "private_package_link"',
  "package identity never replaces II identity",
]) {
  if (!webhook.includes(required)) {
    stop(`paid-fulfillment package separation missing: ${required}`);
  }
}

for (const required of [
  "drop constraint if exists gpm_h2_core_offer_code",
  "core_offer_code in ('hug', 'tug', 'bug')",
  "Never substitutes for inventory_id or canonical II identity",
]) {
  if (!packageMigration.includes(required)) {
    stop(`pending-order package migration missing: ${required}`);
  }
}

if (checkout.includes("PRODUCT_OFFER_LAW.BUG")) {
  stop("BUG checkout was activated without separate authorization");
}

console.log("CROSS-DOMAIN CUSTOMER PACKAGE DP V002 AUDIT: PASS");
console.log("CUSTOMER PACKAGES: HUG · TUG · BUG");
console.log("HUG: KK OR KOMBO · $7.99");
console.log("TUG: sK · $4.99");
console.log("BUG: mK FROM TRM/XCLM/VSND · $1.99 · CHECKOUT HELD");
console.log("PACKAGE NAMES ARE II IDENTITY: NO");
console.log("PLATFORM ROLES: DISTINCT");
console.log("CHECKOUT AUTHORITY: K-KUT ONLY");
console.log("DELIVERY AUTHORITY: K-KUT ONLY");
console.log("ORIGIN ATTRIBUTION: REQUIRED");
