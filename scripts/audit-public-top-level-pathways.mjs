import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");
const stop = (message) => { throw new Error(message); };

const layout = read("app/layout.tsx");
const themes = read("app/themes/page.tsx");
const grid = read("components/ApprovedPublicOptionGrid.tsx");
const checkout = read("app/checkout/route.ts");
const bridge = read("lib/publication-bridge/approvedPublicOptions.ts");

for (const route of ["/find", "/personal", "/holiday", "/themes", "/kupid", "/wedding"]) {
  if (!layout.includes(`href="${route}"`)) stop(`top navigation missing ${route}`);
}
for (const route of ["/kupid", "/wedding"]) {
  if (!themes.includes(`href: "${route}"`)) stop(`Themes hub missing ${route}`);
}
for (const required of ["hugzSeedCatalog.map", "theme.imageUrl", "Start a New Sentimeant", "13 HUGz Cards"]) {
  if (!themes.includes(required)) stop(`visual Themes hub missing ${required}`);
}

for (const required of ['action="/checkout"', 'method="post"', 'name="public_option_id"', 'name="ii"']) {
  if (!grid.includes(required)) stop(`approved option grid missing ${required}`);
}
if (grid.includes("buy.stripe.com") || grid.includes("stripe_url_if_payment_allowed")) {
  stop("approved option grid still depends on legacy payment links");
}

for (const required of [
  'HUG: { inventoryFamily: "KK", offer: "kk", priceCents: 799 }',
  'TUG: { inventoryFamily: "SK", offer: "sk", priceCents: 499 }',
  'BUG: { inventoryFamily: "MK", offer: "mk", priceCents: 199 }',
  "findApprovedPublicOptionByPublicOptionId",
  "stripe.checkout.sessions.create",
]) {
  if (!checkout.includes(required)) stop(`shared checkout missing ${required}`);
}

if (!bridge.includes("record.kk_id_or_delivery_object_id === inventoryId") || !bridge.includes("staged.get(record.kk_id_or_delivery_object_id)")) {
  stop("publication bridge lacks exact-II lookup");
}
if (checkout.includes("CATALOG_URL") || checkout.includes("verifiedInventoryFamily")) {
  stop("legacy public Storage catalog still acts as checkout authority");
}

console.log("PUBLIC TOP-LEVEL PATHWAY AUDIT: PASS");
console.log("THEMES ROUTE: PRESENT");
console.log("PAYMENT: SHARED CURRENT-II SERVER CHECKOUT");
console.log("LOCKED PRICES: HUG 799 / TUG 499 / BUG 199");
console.log("LEGACY PAYMENT-LINK DEPENDENCY: REMOVED FROM SHARED GRID");
