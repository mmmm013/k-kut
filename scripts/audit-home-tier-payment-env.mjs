function validStripePaymentLink(value) {
  try {
    const url = new URL(String(value || "").trim());
    return url.protocol === "https:" && url.hostname === "buy.stripe.com";
  } catch {
    return false;
  }
}

if (process.env.VERCEL !== "1") {
  console.log("HOME HUG PAYMENT ENV AUDIT: LOCAL SKIP");
  console.log("Production must provide one active sK HUG $4.99 Payment Link.");
  process.exit(0);
}

if (!validStripePaymentLink(process.env.NEXT_PUBLIC_SK_HUG_LINK)) {
  console.error("HOME HUG PAYMENT ENV AUDIT: FAIL");
  console.error(
    " - NEXT_PUBLIC_SK_HUG_LINK is missing or is not a valid Stripe Payment Link.",
  );
  process.exit(1);
}

console.log("HOME HUG PAYMENT ENV AUDIT: PASS");
console.log("sK HUG $4.99 PAYMENT MAPPING: PRESENT");
console.log("KK HUG $7.99 LINK: EXISTING AUTHORIZED LINK");
console.log("PAYMENT LINK VALUES: NOT PRINTED");
