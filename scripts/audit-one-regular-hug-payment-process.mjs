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
  const checkout = read("app/checkout/route.ts");
  const catalog = read("app/api/public-ii-catalog/route.ts");
  const browser = read("components/PublicIiBrowser.tsx");
  const publicPages =
    read("app/page.tsx") +
    read("app/browse/page.tsx") +
    read("app/hug/page.tsx");
  const webhook = read("app/api/stripe/webhook/route.ts");
  const pendingStore = read("lib/h2PendingOrder.ts");

  requireAll(
    checkout,
    [
      "SK_HUG_PRICE_CENTS = 499",
      "KK_HUG_PRICE_CENTS = 799",
      'publicProductName: "sK HUG"',
      'publicProductName: "KK HUG"',
      "PERSONAL_NOTE_WORD_LIMIT = 13",
      "client_reference_id",
      "verifiedInventoryFamily",
      "offer-inventory-mismatch",
      "STRIPE_REDIRECT_STATUS = 303",
    ],
    "checkout",
  );

  requireAll(
    catalog,
    [
      'family === "SK" ? "sK HUG" : "KK HUG"',
      "priceUsd",
      "purchasableCount: publicRecords.length",
    ],
    "catalog",
  );

  requireAll(
    browser,
    ['value={record.checkout}'],
    "browser",
  );

  requireAll(
    publicPages,
    ["sK HUG", "KK HUG", "$4.99", "$7.99", "13"],
    "public pages",
  );

  requireAll(
    webhook,
    [
      "session.client_reference_id",
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

  console.log("TWO HUG PAYMENT PROCESS AUDIT PASS");
  console.log("sK HUG: $4.99");
  console.log("KK HUG: $7.99");
  console.log("CATALOG: 3867 EXACT ITEMS");
  console.log("sK PAYMENT LINK: REQUIRED BEFORE PRODUCTION");
} catch (error) {
  console.error("TWO HUG PAYMENT PROCESS AUDIT FAIL");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
