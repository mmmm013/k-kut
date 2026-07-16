const REQUIRED_PAYMENT_LINKS = [
  {
    key: "NEXT_PUBLIC_MD_MOMENT_KK_LINK",
    product: "Short KUT",
    price: "$4.99",
  },
  {
    key: "NEXT_PUBLIC_MD_FEATURED_KK_LINK",
    product: "Big HUG",
    price: "$12.99",
  },
];

function validStripePaymentLink(value) {
  try {
    const url = new URL(String(value || "").trim());
    return url.protocol === "https:" && url.hostname === "buy.stripe.com";
  } catch {
    return false;
  }
}

if (process.env.VERCEL !== "1") {
  console.log("HOME TIER PAYMENT ENV AUDIT: LOCAL SKIP");
  console.log("Vercel Preview and Production builds enforce the two curated payment mappings.");
  process.exit(0);
}

const failures = [];

for (const item of REQUIRED_PAYMENT_LINKS) {
  if (!validStripePaymentLink(process.env[item.key])) {
    failures.push(`${item.product} ${item.price}: ${item.key} is missing or not a valid Stripe Payment Link.`);
  }
}

if (failures.length) {
  console.error("HOME TIER PAYMENT ENV AUDIT: FAIL");
  for (const failure of failures) console.error(` - ${failure}`);
  process.exit(1);
}

console.log("HOME TIER PAYMENT ENV AUDIT: PASS");
console.log("SHORT KUT $4.99 PAYMENT MAPPING: PRESENT");
console.log("BIG HUG $12.99 PAYMENT MAPPING: PRESENT");
console.log("PAYMENT HOST: buy.stripe.com");
console.log("PAYMENT LINK VALUES: NOT PRINTED");
