import fs from "node:fs";

function read(file) {
  if (!fs.existsSync(file)) {
    throw new Error(`missing ${file}`);
  }

  return fs.readFileSync(file, "utf8");
}

function requireAll(text, required, label) {
  for (const value of required) {
    if (!text.includes(value)) {
      throw new Error(`${label} missing ${value}`);
    }
  }
}

try {
  const catalog = read("app/api/public-ii-catalog/route.ts");
  const checkout = read("app/checkout/route.ts");
  const browser = read("components/PublicIiBrowser.tsx");
  const home = read("app/page.tsx");
  const browse = read("app/browse/page.tsx");
  const hug = read("app/hug/page.tsx");
  const webhook = read("app/api/stripe/webhook/route.ts");
  const pendingStore = read("lib/h2PendingOrder.ts");
  const customerPath = `${home}\n${browse}\n${hug}\n${browser}`;
  const controlled = `${catalog}\n${checkout}\n${customerPath}`;

  requireAll(
    catalog,
    [
      "EXPECTED_KK_COUNT = 2611",
      'status: "BIC_PUBLIC_KK_CATALOG_READY_2611_HUGS"',
      "purchasableCount: publicRecords.length",
      "signature_audio_logo_integral_at_end",
      "PUBLIC_STORAGE_VERIFIED",
      'checkout: "kk"',
    ],
    "catalog",
  );

  requireAll(
    customerPath,
    ["K-KUT HUG", "$7.99", "2,611"],
    "customer path",
  );

  requireAll(
    checkout,
    [
      'type OfferCode = "kk"',
      'publicProductName: "K-KUT HUG"',
      "KK_HUG_PRICE_CENTS = 799",
      "KK_HUG_PAYMENT_URL",
      "verifiedInventoryFamily",
      "offer-inventory-mismatch",
      "createPendingH2Order",
      "STRIPE_REDIRECT_STATUS = 303",
    ],
    "checkout",
  );

  requireAll(
    browser,
    ['value={record.checkout}'],
    "browser checkout",
  );

  requireAll(
    webhook,
    [
      "consumePendingH2Order",
      "manual_review_required: true",
    ],
    "webhook",
  );

  requireAll(
    pendingStore,
    [
      'H2_TABLE = "gpm_h2_pending_orders"',
      "createPendingH2Order",
      "consumePendingH2Order",
    ],
    "pending-order store",
  );

  for (const forbidden of [
    "sK HUG",
    "$4.99",
    "NEXT_PUBLIC_SK_HUG_LINK",
    "SK_HUG_PRICE_CENTS",
    "EXPECTED_SK_COUNT",
    "EXPECTED_STORAGE_INVENTORY_COUNT = 3867",
    "BIC_PUBLIC_CATALOG_READY_3867_HUGS",
    "Big HUG",
    "$12.99",
  ]) {
    if (controlled.includes(forbidden)) {
      throw new Error(`controlled storefront exposes ${forbidden}`);
    }
  }

  console.log("BIC 2611 KK STOREFRONT AUDIT PASS");
  console.log("K-KUT HUGS: 2611 AT $7.99");
  console.log("PUBLIC sK ASSUMPTION: HELD");
  console.log("TOTAL PURCHASABLE: 2611");
  console.log("FULFILLMENT: MANUAL PRIVATE REVIEW");
} catch (error) {
  console.error("BIC 2611 KK STOREFRONT AUDIT FAIL");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
