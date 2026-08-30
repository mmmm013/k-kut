import fs from "node:fs";

const read = (file) => fs.readFileSync(file, "utf8");
const parse = (file) => JSON.parse(read(file));
const fail = (message) => {
  throw new Error(`CONTROLLED PURCHASE CANARY AUDIT FAIL: ${message}`);
};

const II_ID =
  "ii-romance-reuse-d3dfd13c-7421-4671-8261-0c735cb51f38";
const PUBLIC_OPTION_ID =
  "generated-love-sweet-d3dfd13c-7421-4671-8261-0c735cb51f38";
const AUDIO_ROUTE = `/api/ii-delivery/${PUBLIC_OPTION_ID}`;
const DELIVERY_SHA256 =
  "21155af2dbfefdf2ff90bec6b0a2458485dfd178994b430054edca8aa635b6b1";

const canary = parse("data/production/first-production-canary-v1.json");
const bridge = parse(
  "data/publication-bridge/public-option-records.generated.json",
);
const privateAudio = parse("config/current-ii-private-audio.v1.json");
const checkout = read("app/checkout/route.ts");
const webhook = read("app/api/stripe/webhook/route.ts");
const audioRoute = read("app/api/ii-delivery/[publicOptionId]/route.ts");
const catalogRoute = read("app/api/public-ii-catalog/route.ts");
const successPage = read("app/order/success/page.tsx");

const staged = (canary.records || []).filter(
  (record) =>
    record.status === "STAGE" &&
    (record.missing_current_proof?.length || 0) === 0,
);
if (staged.length !== 1 || staged[0].ii_id !== II_ID) {
  fail("exactly one governed II must be STAGE");
}
if (
  staged[0].product_family !== "HUG" ||
  staged[0].inventory_family !== "KK" ||
  staged[0].price_cents !== 799 ||
  staged[0].delivery_sha256 !== DELIVERY_SHA256 ||
  staged[0].delivery_audio_url !== AUDIO_ROUTE ||
  staged[0].release_authority?.authorized_public_option_id !== PUBLIC_OPTION_ID
) {
  fail("STAGE II identity, price, audio, or option authority drifted");
}

const purchasable = (bridge.records || []).filter(
  (record) => record.payment_allowed === true,
);
if (purchasable.length !== 1 || purchasable[0].public_option_id !== PUBLIC_OPTION_ID) {
  fail("exactly one public option must be purchasable");
}
const option = purchasable[0];
if (
  option.kk_id_or_delivery_object_id !== II_ID ||
  option.product_family !== "HUG" ||
  option.inventory_family !== "KK" ||
  option.price_cents !== 799 ||
  option.audio_proof_status !== "pass" ||
  option.audio_delivery_url !== AUDIO_ROUTE ||
  option.public_route !== "/romance"
) {
  fail("purchasable public option exceeds the locked canary");
}
for (const held of (bridge.records || []).filter(
  (record) => record.public_option_id !== PUBLIC_OPTION_ID,
)) {
  if (held.payment_allowed !== false || held.audio_delivery_url !== "") {
    fail(`held option exposes payment or audio ${held.public_option_id}`);
  }
}

const privateRecord = (privateAudio.records || []).find(
  (record) => record.ii_id === II_ID,
);
if (
  privateAudio.bucket_must_be_public !== false ||
  privateAudio.customer_preview_signed_url_ttl_seconds !== 60 ||
  privateRecord?.authority_state !== "STAGE_CONTROLLED_PURCHASE_CANARY" ||
  privateRecord?.sha256 !== DELIVERY_SHA256
) {
  fail("private object or short-lived preview authority drifted");
}

for (const required of [
  'process.env.VERCEL_ENV !== "production"',
  "findApprovedPublicOptionByPublicOptionId",
  "publicationOption.price_cents !== config.priceCents",
  "unit_amount: config.priceCents",
  "stripe.checkout.sessions.create",
  'returnToStore(request, "checkout-post-required")',
  "phone_number_collection: { enabled: true }",
  'key: "recipientmobile"',
  'custom: "Recipient mobile number"',
  'sales_canary: "one_ii_one_public_option"',
  "/order/success?session_id={CHECKOUT_SESSION_ID}",
  "function isLiveStripeSecretKey(value: string)",
  'returnToStore(request, "stripe-secret-key-invalid")',
]) {
  if (!checkout.includes(required)) fail(`checkout missing ${required}`);
}
if (
  checkout.indexOf('returnToStore(request, "stripe-secret-key-invalid")') >
  checkout.indexOf("token = await createPendingH2Order")
) {
  fail("invalid Stripe key can create an orphan pending order");
}
for (const forbidden of ["buy.stripe.com", "NEXT_PUBLIC_KKUT_HUG_PAYMENT_URL"]) {
  if (checkout.includes(forbidden)) fail(`checkout contains bypass ${forbidden}`);
}

for (const required of [
  'checkoutTextField(session, "recipientmobile")',
  "recipient_mobile_present",
  'recipient_mobile_source: recipientMobile',
  "fulfill_exact_selected_ii_to_recipient_mobile",
  "enforceCurrentIiAuthority",
]) {
  if (!webhook.includes(required)) fail(`webhook missing ${required}`);
}

for (const required of [
  "findApprovedPublicOptionByPublicOptionId",
  "findCurrentIiPrivateAudio",
  "createSignedUrl(",
  "customerPreviewSignedUrlTtlSeconds",
  "NextResponse.redirect(data.signedUrl, 307)",
]) {
  if (!audioRoute.includes(required)) fail(`audio route missing ${required}`);
}
for (const forbidden of ["getPublicUrl(", "/object/public/"]) {
  if (audioRoute.includes(forbidden)) fail(`audio route exposes ${forbidden}`);
}

if (!catalogRoute.includes("loadAllApprovedPublicOptions")) {
  fail("public catalog is not sourced from the exact approval gate");
}
for (const required of [
  "stripe.checkout.sessions.retrieve(sessionId)",
  'session.payment_status === "paid"',
  "recipient mobile number entered at checkout",
]) {
  if (!successPage.includes(required)) fail(`success page missing ${required}`);
}

console.log("CONTROLLED PURCHASE CANARY AUDIT: PASS");
console.log(`STAGE II: ${II_ID}`);
console.log(`PUBLIC OPTION: ${PUBLIC_OPTION_ID}`);
console.log("PRICE: USD 7.99");
console.log("OTHER PURCHASABLE IIs: 0");
console.log("CHECKOUT: SERVER-CREATED STRIPE SESSION");
console.log("FULFILLMENT: EXACT II · RECIPIENT MOBILE · MANUAL REVIEW");
