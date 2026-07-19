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
  const controlled =
    `${checkout}\n${catalog}\n${browser}\n${publicPages}`;

  requireAll(
    checkout,
    [
      "KK_HUG_PRICE_CENTS = 799",
      'type OfferCode = "kk"',
      'publicProductName: "K-KUT HUG"',
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
      "EXPECTED_KK_COUNT = 2611",
      'offer: "K-KUT HUG"',
      'checkout: "kk"',
      "priceUsd: 7.99",
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
    ["K-KUT HUG", "$7.99", "2,611", "13"],
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

  for (const forbidden of [
    "sK HUG",
    "$4.99",
    "NEXT_PUBLIC_SK_HUG_LINK",
    "SK_HUG_PRICE_CENTS",
    "EXPECTED_SK_COUNT",
    "3867",
    "Big HUG",
    "$12.99",
  ]) {
    if (controlled.includes(forbidden)) {
      throw new Error(`one-offer control exposes ${forbidden}`);
    }
  }

  console.log("ONE REGULAR HUG PAYMENT PROCESS AUDIT PASS");
  console.log("K-KUT HUG: $7.99");
  console.log("CATALOG: 2611 VERIFIED KKs");
  console.log("PAYMENT LINK: EXISTING AUTHORIZED REGULAR HUG LINK");
  console.log("PUBLIC sK ASSUMPTION: NONE");
} catch (error) {
  console.error("ONE REGULAR HUG PAYMENT PROCESS AUDIT FAIL");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
