import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");
const stop = (message) => {
  throw new Error(message);
};

const layout = read("app/layout.tsx");
const themes = read("app/themes/page.tsx");
const grid = read("components/ApprovedPublicOptionGrid.tsx");
const checkout = read("app/checkout/route.ts");
const bridge = read("lib/publication-bridge/approvedPublicOptions.ts");

for (const route of [
  "/find",
  "/personal",
  "/holiday",
  "/themes",
  "/kupid",
  "/wedding",
]) {
  if (!layout.includes(`href="${route}"`)) {
    stop(`top navigation missing ${route}`);
  }
}

for (const route of [
  "/kupid",
  "/wedding",
]) {
  if (!themes.includes(`href: "${route}"`)) {
    stop(`Themes hub missing ${route}`);
  }
}

for (const required of [
  "hugzSeedCatalog.map",
  "theme.imageUrl",
  "Start a New Sentimeant",
  "13 HUGz Cards",
]) {
  if (!themes.includes(required)) {
    stop(`visual Themes hub missing ${required}`);
  }
}

for (const required of [
  "NEXT_PUBLIC_KKUT_REVIEWED_HUG_PAYMENT_URL",
  "reviewedLemonSqueezyPaymentUrl",
  "href={paymentUrl}",
  'hostname.endsWith(".lemonsqueezy.com")',
  "record.price_cents",
]) {
  if (!grid.includes(required)) {
    stop(`approved option grid missing ${required}`);
  }
}

for (const forbidden of [
  'action="/checkout"',
  "href={record.stripe_url_if_payment_allowed}",
  "buy.stripe.com",
]) {
  if (grid.includes(forbidden)) {
    stop(`approved option grid bypasses reviewed Lemon authority: ${forbidden}`);
  }
}

if (
  !checkout.includes("lemon-squeezy-direct-link-required") ||
  checkout.includes("stripe.checkout.sessions.create") ||
  checkout.includes("STRIPE_SECRET_KEY")
) {
  stop("legacy direct-Stripe checkout route is not closed");
}

if (!bridge.includes("record.kk_id_or_delivery_object_id === inventoryId") ||
    !bridge.includes("staged.get(record.kk_id_or_delivery_object_id)")) {
  stop("publication bridge lacks exact-II lookup");
}

if (checkout.includes("CATALOG_URL") || checkout.includes("verifiedInventoryFamily")) {
  stop("legacy public Storage catalog still acts as checkout authority");
}

console.log("PUBLIC TOP-LEVEL PATHWAY AUDIT: PASS");
console.log("THEMES ROUTE: PRESENT");
console.log("APPROVED PAYMENT SURFACE: REVIEWED LEMON SQUEEZY");
console.log("LEGACY DIRECT STRIPE ROUTE: BLOCKED");
console.log("UNAPPROVED PAYMENT BYPASS: 0");
