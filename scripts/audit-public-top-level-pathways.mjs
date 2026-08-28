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
  "record.kk_id_or_delivery_object_id",
  'name="offer" value="kk"',
]) {
  if (!grid.includes(required)) {
    stop(`approved option grid missing ${required}`);
  }
}

if (grid.includes("href={record.stripe_url_if_payment_allowed}")) {
  stop("Wedding/Kupid still bypass governed checkout");
}

for (const required of [
  "findApprovedPublicOptionByInventoryId",
  "publicationOption",
  "const paymentUrl = config.paymentUrl",
]) {
  if (!checkout.includes(required)) {
    stop(`checkout missing publication authority: ${required}`);
  }
}

if (checkout.includes("publicationOption?.stripe_url_if_payment_allowed ||")) {
  stop("catalog publication row illegally overrides commerce price authority");
}

if (!bridge.includes("record.kk_id_or_delivery_object_id === inventoryId")) {
  stop("publication bridge lacks exact-II lookup");
}

console.log("PUBLIC TOP-LEVEL PATHWAY AUDIT: PASS");
console.log("THEMES ROUTE: PRESENT");
console.log("WEDDING CHECKOUT: GOVERNED EXACT-II");
console.log("KUPID CHECKOUT: GOVERNED EXACT-II");
console.log("DIRECT STRIPE BYPASS: 0");
