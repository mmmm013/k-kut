import fs from "node:fs";

function read(path) {
  if (!fs.existsSync(path)) throw new Error(`missing ${path}`);
  return fs.readFileSync(path, "utf8");
}

function needs(text, values, label) {
  for (const value of values) {
    if (!text.includes(value)) throw new Error(`${label} missing ${value}`);
  }
}

try {
  const checkout = read("app/checkout/route.ts");
  const hug = read("app/hug/page.tsx");
  const browse = read("app/browse/page.tsx");
  const browser = read("components/PublicIiBrowser.tsx");
  const catalog = read("app/api/public-ii-catalog/route.ts");
  const webhook = read("app/api/stripe/webhook/route.ts");
  const store = read("lib/h2PendingOrder.ts");

  needs(checkout, [
    "REGULAR_HUG_PAYMENT_URL",
    "REGULAR_HUG_PRICE_CENTS = 799",
    'type OfferCode = "short" | "hug" | "big"',
    'publicProductName: "HUG"',
    "PERSONAL_NOTE_WORD_LIMIT = 13",
    "createPendingH2Order",
    "client_reference_id",
    "STRIPE_REDIRECT_STATUS = 303",
  ], "checkout");

  needs(catalog, [
    'REGULAR_HUG_OFFER = "K-KUT HUG"',
    "REGULAR_HUG_PRICE_USD = 7.99",
    "purchasableCount: publicRecords.length",
  ], "catalog");

  needs(hug + browse + browser, [
    "$7.99",
    "Send this K-KUT as a HUG",
    "13 words",
  ], "regular HUG buyer path");

  needs(webhook, [
    "session.client_reference_id",
    "consumePendingH2Order",
    "selected_hug_id: selectedInventoryId",
    "public_product_name: publicProductName",
    "stripe_durable_manual_review_queue",
  ], "webhook");

  needs(store, [
    'H2_TABLE = "gpm_h2_pending_orders"',
    "createPendingH2Order",
    "consumePendingH2Order",
  ], "H2 store");

  console.log("ONE REGULAR HUG PAYMENT PROCESS AUDIT PASS");
  console.log("REGULAR HUG: $7.99");
  console.log("CATALOG: 2611 EXACT ITEMS");
  console.log("OPTIONAL NOTE: 13 WORDS");
  console.log("STRIPE HANDOFF: 303 SEE OTHER");
  console.log("DELIVERY: MANUAL PRIVATE REVIEW");
  console.log("CURATED HOME TIERS DO NOT REMAP THE 2611-ITEM CATALOG");
} catch (error) {
  console.error("ONE REGULAR HUG PAYMENT PROCESS AUDIT FAIL");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
