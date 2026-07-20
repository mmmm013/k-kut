import fs from "node:fs";

function validStripePaymentLink(value) {
  try {
    const url = new URL(String(value || "").trim());
    return url.protocol === "https:" && url.hostname === "buy.stripe.com";
  } catch {
    return false;
  }
}

const checkout = fs.readFileSync("app/checkout/route.ts", "utf8");
const lockedKkLink = "https://buy.stripe.com/fZu8wOawC4wicy8fbU4ow0y";

if (!checkout.includes(lockedKkLink)) {
  console.error("HOME HUG PAYMENT ENV AUDIT: FAIL");
  console.error(" - Authorized KK HUG $7.99 Payment Link is missing from checkout.");
  process.exit(1);
}

const skPaymentReady = validStripePaymentLink(
  process.env.NEXT_PUBLIC_SK_HUG_LINK,
);

console.log("HOME HUG PAYMENT ENV AUDIT: PASS");
console.log("KK HUG $7.99 PAYMENT MAPPING: PRESENT");

if (skPaymentReady) {
  console.log("sK HUG $4.99 PAYMENT MAPPING: PRESENT");
} else {
  console.log("sK HUG $4.99 PRODUCT LAW: ACTIVE");
  console.log("sK PAYMENT STATUS: ACTIVE PAYMENT LINK REQUIRED");
  console.log("PRODUCTION PURCHASE LANE: KK HUG ONLY");
}

console.log("PAYMENT LINK VALUES: NOT PRINTED");
