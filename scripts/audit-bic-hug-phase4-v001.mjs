import fs from "node:fs";

const read = (file) => fs.readFileSync(file, "utf8");
const fail = (message) => {
  throw new Error(`BIC PHASE 4 FAIL: ${message}`);
};

const page = read("app/hug-pilot/page.tsx");
const layout = read("app/layout.tsx");
const checkout = read("app/checkout/route.ts");

for (const required of [
  'action="/checkout"',
  'method="post"',
  'name="ii"',
  'name="offer" value="kk"',
  "Three ready HUG paths",
  "exact governed music choice",
]) {
  if (!page.includes(required)) fail(`pilot page ${required}`);
}
if (page.includes("buy.stripe.com")) fail("direct Stripe URL in pilot page");
if (!layout.includes('href="/hug-pilot"') || !layout.includes("Ready HUGs")) {
  fail("K-KUT navigation");
}

for (const required of [
  "createPendingH2Order",
  "findApprovedPublicOptionByInventoryId",
  "PUBLIC_STORAGE_VERIFIED",
  "signature_audio_logo_integral_at_end",
  "inventoryId",
  "customerPackageCode",
  "originDomain",
]) {
  if (!checkout.includes(required)) fail(`checkout ${required}`);
}

console.log("BIC HUG AUDIT PHASE 4: PASS");
