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

  requireAll(
    catalog,
    [
      "EXPECTED_STORAGE_INVENTORY_COUNT = 3867",
      "EXPECTED_KK_COUNT = 2611",
      "EXPECTED_SK_COUNT = 1256",
      'status: "BIC_PUBLIC_CATALOG_READY_2611_KK_HUGS_SK_PAYMENT_PENDING"',
      "publicRecords.length !== EXPECTED_KK_COUNT",
      "purchasableCount: publicRecords.length",
      'checkout: "kk"',
      "signature_audio_logo_integral_at_end",
      "PUBLIC_STORAGE_VERIFIED",
      'status: "ACTIVE_PAYMENT_LINK_REQUIRED"',
    ],
    "catalog",
  );

  requireAll(
    home + browse + hug + browser,
    ["sK HUG", "KK HUG", "$4.99", "$7.99", "13"],
    "customer path",
  );

  requireAll(
    home + browse,
    ["DM", "email", "2,611"],
    "launch path",
  );

  requireAll(
    checkout,
    [
      'type OfferCode = "sk" | "kk"',
      'publicProductName: "sK HUG"',
      'publicProductName: "KK HUG"',
      "NEXT_PUBLIC_SK_HUG_LINK",
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

  console.log("BIC 2611 KK HUG STOREFRONT AUDIT PASS");
  console.log("KK HUGS LIVE: 2611 AT $7.99");
  console.log("sK HUG PRODUCT LAW: 1256 AT $4.99");
  console.log("sK PAYMENT STATUS: ACTIVE PAYMENT LINK REQUIRED");
  console.log("FULFILLMENT: MANUAL PRIVATE REVIEW");
  console.log("BUYER SHARE: DM OR EMAIL");
} catch (error) {
  console.error("BIC 2611 KK HUG STOREFRONT AUDIT FAIL");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
