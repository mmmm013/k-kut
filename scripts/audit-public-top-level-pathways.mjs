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
  'action="/checkout"',
  'name="ii"',
  'name="public_option_id"',
  "record.kk_id_or_delivery_object_id",
  "checkoutOffer(record)",
]) {
  if (!grid.includes(required)) {
    stop(`approved option grid missing ${required}`);
  }
}

if (grid.includes("href={record.stripe_url_if_payment_allowed}")) {
  stop("Wedding/Kupid still bypass governed checkout");
}

for (const required of [
  "findApprovedPublicOptionByPublicOptionId",
  "publicationOption",
  "publicationOption.kk_id_or_delivery_object_id !== inventoryId",
  "publicationOption.inventory_family !== config.family",
  "publicationOption.product_family !== config.productFamily",
  "stripe.checkout.sessions.create",
]) {
  if (!checkout.includes(required)) {
    stop(`checkout missing publication authority: ${required}`);
  }
}

if (checkout.includes("publicationOption?.stripe_url_if_payment_allowed ||") ||
    checkout.includes("buy.stripe.com")) {
  stop("catalog or Payment Link illegally overrides commerce price authority");
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
console.log("WEDDING CHECKOUT: GOVERNED EXACT-II");
console.log("KUPID CHECKOUT: GOVERNED EXACT-II");
console.log("DIRECT STRIPE BYPASS: 0");
