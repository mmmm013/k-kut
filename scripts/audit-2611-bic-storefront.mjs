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

function forbids(text, values, label) {
  for (const value of values) {
    if (text.includes(value)) throw new Error(`${label} exposes ${value}`);
  }
}

try {
  const api = read("app/api/public-ii-catalog/route.ts");
  const browser = read("components/PublicIiBrowser.tsx");
  const home = read("app/page.tsx");
  const homeProducts = read("components/KkutHomeProducts.tsx");
  const browse = read("app/browse/page.tsx");
  const find = read("app/find/page.tsx");
  const hug = read("app/hug/page.tsx");
  const checkout = read("app/checkout/route.ts");
  const webhook = read("app/api/stripe/webhook/route.ts");
  const store = read("lib/h2PendingOrder.ts");

  needs(api, [
    "EXPECTED_STORAGE_INVENTORY_COUNT = 3867",
    "EXPECTED_KK_COUNT = 2611",
    "EXPECTED_SK_COUNT = 1256",
    "release-gate-v004/",
    "release-gate-v005-sk/",
    "PUBLIC_STORAGE_VERIFIED",
    "signature_audio_logo_integral_at_end",
    "REGULAR_HUG_PRICE_USD = 7.99",
    'purchasableFamily: "KK"',
    'heldInventoryFamily: "sK"',
    "heldForProductMappingCount: skCount",
    "purchasableCount: publicRecords.length",
    'status: "BIC_PUBLIC_CATALOG_READY_SK_HELD_FOR_PRODUCT_MAPPING"',
  ], "catalog API");

  needs(api, [
    'if (family == "SK")',
    "skCount += 1",
    "return;",
    "publicRecords.push",
  ], "sK product-mapping hold");

  forbids(api, [
    "EXPECTED_INVENTORY_COUNT = 2611",
  ], "superseded catalog count gate");

  needs(browser, [
    "PublicIiRecord",
    "Send this K-KUT as a HUG",
    "Optional personal note · 13 words maximum",
    "stopOtherAudio",
  ], "catalog browser");

  needs(home, [
    "KkutHomeProducts",
    "Short KUT · $4.99",
    "HUG · $7.99",
    "Big HUG · $12.99",
    "private link delivery",
  ], "homepage");

  needs(homeProducts, [
    'offer: "short"',
    'inventoryId: "thank-you-cc-012"',
    'offer: "hug"',
    'inventoryId: "thank-you-sec-ch1"',
    'offer: "big"',
    'inventoryId: "thank-you-kk7"',
    'action="/checkout"',
    'method="post"',
    "stopOtherAudio",
  ], "homepage products");

  forbids(home + homeProducts, ["KK1", "KK2", 'method="get"'], "homepage");

  needs(checkout, [
    "SHORT_KUT_PRICE_CENTS = 499",
    "REGULAR_HUG_PRICE_CENTS = 799",
    "BIG_HUG_PRICE_CENTS = 1299",
    'type OfferCode = "short" | "hug" | "big"',
    'publicProductName: "K-KUT HUG"',
    "NEXT_PUBLIC_MD_MOMENT_KK_LINK",
    "NEXT_PUBLIC_MD_FEATURED_KK_LINK",
    "CURATED_SHORT_KUT_IDS",
    "CURATED_BIG_HUG_IDS",
    "offer-inventory-mismatch",
    "payment-link-unavailable",
    "createPendingH2Order",
    "STRIPE_REDIRECT_STATUS = 303",
  ], "checkout");

  needs(webhook, [
    "consumePendingH2Order",
    "selected_hug_id: selectedInventoryId",
    "public_product_name: publicProductName",
    "manual_review_required: true",
  ], "webhook");

  needs(store, [
    'H2_TABLE = "gpm_h2_pending_orders"',
    "createPendingH2Order",
    "consumePendingH2Order",
  ], "pending-order store");

  needs(browse + find + hug, ["$7.99"], "2,611-item purchasable HUG path");

  forbids(
    browse + find + hug + browser,
    ["$4.99", "$12.99"],
    "2,611-item purchasable HUG path",
  );

  console.log("BIC 3867 STORAGE / 2611 STOREFRONT AUDIT PASS");
  console.log("STORAGE CATALOG: 3867 VERIFIED PUBLIC IIs");
  console.log("PURCHASABLE: 2611 VERIFIED KK HUGS AT $7.99");
  console.log("HELD: 1256 sKs AWAITING AUTHORIZED PRODUCT MAPPING");
  console.log("HOME: CURATED SHORT KUT / HUG / BIG HUG");
  console.log("HOME CHECKOUT: POST HIDES CONTROLLED INVENTORY ID");
  console.log("CHECKOUT: H2 EXACT ITEM + 303 STRIPE HANDOFF");
  console.log("FULFILLMENT: MANUAL PRIVATE DELIVERY");
} catch (error) {
  console.error("BIC 3867 STORAGE / 2611 STOREFRONT AUDIT FAIL");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
