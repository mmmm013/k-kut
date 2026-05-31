import fs from "node:fs";

const sourcePath = "data/ii-delivery-registry/romance-reusable-ii-records.json";
const outPath = "data/publication-bridge/public-option-records.generated.json";

const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
const records = Array.isArray(source.records) ? source.records : [];

function slug(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function routeToPublicRoute(routeId) {
  if (routeId.startsWith("wedding")) return "/wedding";
  if (routeId.startsWith("kupid")) return "/kupid";
  if (routeId.includes("anniversary")) return "/personal/anniversary";
  if (routeId.includes("repair")) return "/personal/apology";
  return "/romance";
}

function inferIntentLane(routeId) {
  if (routeId.startsWith("wedding")) return "wedding";
  if (routeId.startsWith("kupid")) return "kupid_romance";
  if (routeId.includes("anniversary")) return "anniversary";
  if (routeId.includes("repair")) return "repair_still_care";
  if (routeId.includes("love")) return "romance_love";
  return "personal_romance";
}

function inferObject(routeId) {
  if (routeId.includes("spark")) return "spark";
  if (routeId.includes("wedding") || routeId.includes("forever")) return "commitment";
  if (routeId.includes("repair")) return "repair";
  if (routeId.includes("anniversary")) return "devotion";
  if (routeId.includes("deep")) return "devotion";
  return "warmth";
}

function wordsFrom(...values) {
  return [...new Set(values
    .join(" ")
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 3)
    .slice(0, 8))];
}

const generated = [];

for (const item of records) {
  if (item.admin_override_required === true) continue;
  if (item.delivery_status !== "delivery_audio_materialized_bookend_twinkle") continue;
  if (!item.delivery_audio_url?.startsWith("/ii-delivery/")) continue;
  if (!Array.isArray(item.routes)) continue;

  for (const route of item.routes) {
    if (!route.checkout_url?.startsWith("https://buy.stripe.com/")) continue;

    const routeId = route.route_id || "";
    const object = inferObject(routeId);

    generated.push({
      public_option_id: `generated-${slug(routeId)}-${slug(item.kk_id)}`,
      source_pix_id_or_track_id: item.kk_id || item.ii_id,
      kk_id_or_delivery_object_id: item.ii_id || item.kk_id,
      display_title: item.public_label || "K-KUT HUG",
      interpretation_summary: route.buyer_question || "Send a private K-KUT HUG.",
      action_object_meaning: {
        verb: "send",
        object,
        situation: route.buyer_label || routeId
      },
      positive_connotations: wordsFrom(route.buyer_label, route.buyer_question, object),
      negative_connotations: [],
      neutral_connotations: ["private", "music", "hug"],
      shared_emotion_ids: wordsFrom(routeId, route.buyer_label),
      buyer_scenario_ids: [slug(routeId)],
      intent_lane: inferIntentLane(routeId),
      risk_level: "standard",
      approval_status: "public_approved_generated_from_reusable_ii",
      audio_delivery_url: item.delivery_audio_url,
      audio_proof_status: "pass",
      payment_allowed: true,
      stripe_url_if_payment_allowed: route.checkout_url,
      public_route: routeToPublicRoute(routeId),
      more_for_this_feeling_allowed: true,
      more_from_this_track_allowed: true,
      public_notes: "Generated from reusable II delivery registry. Raw router candidates are excluded."
    });
  }
}

fs.writeFileSync(
  outPath,
  JSON.stringify({
    status: "generated",
    source: sourcePath,
    generated_at: new Date().toISOString(),
    records: generated
  }, null, 2) + "\n"
);

console.log(`GENERATED PUBLIC OPTION RECORDS: ${generated.length}`);
console.log(`WROTE ${outPath}`);
