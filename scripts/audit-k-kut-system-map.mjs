import fs from "node:fs";

const jsonPath = "data/system-map/k-kut-system-map.json";
const docPath = "docs/system-map/K_KUT_SYSTEM_TEARDOWN_MAP.md";

let failed = false;

function fail(message) {
  console.error("FAIL:", message);
  failed = true;
}

console.log("K-KUT SYSTEM MAP AUDIT");

if (!fs.existsSync(jsonPath)) fail(`Missing ${jsonPath}`);
if (!fs.existsSync(docPath)) fail(`Missing ${docPath}`);

const map = fs.existsSync(jsonPath) ? JSON.parse(fs.readFileSync(jsonPath, "utf8")) : {};
const doc = fs.existsSync(docPath) ? fs.readFileSync(docPath, "utf8") : "";

for (const path of ["/hug", "/checkout", "/find", "/personal", "/personal/sympathy"]) {
  if (!map.public_buyer_paths?.some((row) => row.path === path)) {
    fail(`Missing public buyer path: ${path}`);
  }
}

const checkout = map.public_buyer_paths?.find((row) => row.path === "/checkout");
if (!checkout || checkout.required_target !== "https://buy.stripe.com/fZu8wOawC4wicy8fbU4ow0y") {
  fail("Checkout must point to regular HUG Stripe link.");
}

const sympathy = map.public_buyer_paths?.find((row) => row.path === "/personal/sympathy");
if (!sympathy || sympathy.payment_allowed !== false || sympathy.audio_allowed !== false) {
  fail("Sympathy must remain no-payment and no-audio.");
}

for (const law of [
  "KKs per search are suitability-limited, not number-limited.",
  "No one-term search.",
  "No title-only search.",
  "Public buyer UI must not expose mK / mini-KUT / mini language by default."
]) {
  if (!map.global_laws?.includes(law)) fail(`Missing global law: ${law}`);
}

for (const phrase of [
  "More for this feeling",
  "More from this track",
  "Regular/basic K-KUT HUGs can sell",
  "Sympathy / grief / memorial / celebration-of-life remain on human-review hold"
]) {
  if (!doc.includes(phrase)) fail(`Doc missing: ${phrase}`);
}

if (failed) {
  console.error("K-KUT SYSTEM MAP AUDIT: FAIL");
  process.exit(1);
}

console.log("K-KUT SYSTEM MAP AUDIT: PASS");
