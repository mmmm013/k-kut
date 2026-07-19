import fs from "node:fs";

const AUTHORIZED_REGULAR_HUG_LINK =
  "https://buy.stripe.com/fZu8wOawC4wicy8fbU4ow0y";

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
  const envExample = read(".env.example");
  const controlledText = `${checkout}\n${envExample}`;

  requireAll(
    checkout,
    [
      AUTHORIZED_REGULAR_HUG_LINK,
      "KK_HUG_PRICE_CENTS = 799",
      'type OfferCode = "kk"',
      'publicProductName: "K-KUT HUG"',
    ],
    "checkout",
  );

  for (const forbidden of [
    "NEXT_PUBLIC_SK_HUG_LINK",
    "SK_HUG_PRICE_CENTS",
    "sK HUG",
    "$4.99",
    "Big HUG",
    "$12.99",
    "NEXT_PUBLIC_MD_",
  ]) {
    if (controlledText.includes(forbidden)) {
      throw new Error(`held payment control exposed ${forbidden}`);
    }
  }

  console.log("REGULAR HUG PAYMENT CONTROL AUDIT PASS");
  console.log("K-KUT HUG: $7.99");
  console.log("AUTHORIZED PAYMENT LINK: LOCKED IN CHECKOUT");
  console.log("PUBLIC PAYMENT ENV VARIABLE: NOT REQUIRED");
  console.log("HELD $4.99 / $12.99 OFFERS: NOT EXPOSED");
} catch (error) {
  console.error("REGULAR HUG PAYMENT CONTROL AUDIT FAIL");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
