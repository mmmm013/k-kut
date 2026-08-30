import fs from "node:fs";

const path = "data/publication-bridge/k-kut-publication-bridge-contract.json";

let failed = false;

function fail(message) {
  console.error("FAIL:", message);
  failed = true;
}

console.log("PUBLICATION BRIDGE CONTRACT AUDIT");

if (!fs.existsSync(path)) {
  fail(`Missing ${path}`);
} else {
  const data = JSON.parse(fs.readFileSync(path, "utf8"));

  for (const field of [
    "public_option_id",
    "source_pix_id_or_track_id",
    "kk_id_or_delivery_object_id",
    "product_family",
    "inventory_family",
    "price_cents",
    "interpretation_summary",
    "shared_emotion_ids",
    "intent_lane",
    "approval_status",
    "audio_delivery_url",
    "payment_allowed",
    "public_route",
    "more_for_this_feeling_allowed",
    "more_from_this_track_allowed"
  ]) {
    if (!data.required_bridge_fields?.includes(field)) {
      fail(`Missing bridge field: ${field}`);
    }
  }

  for (const law of [
    "No raw inventory item may publish directly to buyer UI.",
    "No item may publish, play, enter checkout, deliver, or fulfill unless its exact ii_id is STAGE in the current production canary.",
    "Checkout and fulfillment must preserve the exact public_option_id and its exact ii_id together so semantic context cannot collapse to an ambiguous inventory match.",
    "No one-term search may publish directly to buyer UI.",
    "No title-only match may publish directly to buyer UI.",
    "No payment appears until approval_status is public_approved and payment_allowed is true.",
    "No audio player appears until audio_proof_status is pass.",
    "High-risk lanes require human-approved intent registry before cards, audio, send buttons, or Stripe links.",
    "More for this feeling expands across approved bridge records only.",
    "More from this track expands within the same source track or PIX only, and only across approved bridge records."
  ]) {
    if (!data.publication_laws?.includes(law)) {
      fail(`Missing publication law: ${law}`);
    }
  }

  for (const route of ["/find", "/hug", "/personal", "/holiday", "/kupid", "/wedding", "/romance"]) {
    if (!data.known_public_routes?.includes(route)) {
      fail(`Missing public route: ${route}`);
    }
  }
}

if (failed) {
  console.error("PUBLICATION BRIDGE CONTRACT AUDIT: FAIL");
  process.exit(1);
}

console.log("PUBLICATION BRIDGE CONTRACT AUDIT: PASS");
