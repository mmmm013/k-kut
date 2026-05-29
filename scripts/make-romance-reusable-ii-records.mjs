import fs from "node:fs";

const shortlistPath = "reports/ii-candidates/romance-sales-shortlist.public.json";
const outJson = "data/ii-delivery-registry/romance-reusable-ii-records.json";
const outMd = "reports/ii-candidates/romance-reusable-ii-records.md";

if (!fs.existsSync(shortlistPath)) {
  console.error("Missing shortlist:", shortlistPath);
  process.exit(1);
}

const shortlist = JSON.parse(fs.readFileSync(shortlistPath, "utf8"));
const picks = shortlist.picks || [];

const byKk = new Map();

for (const pick of picks) {
  const existing = byKk.get(pick.kk_id);

  if (!existing) {
    byKk.set(pick.kk_id, {
      ii_id: `ii-romance-reuse-${pick.kk_id}`,
      kk_id: pick.kk_id,
      public_label: pick.public_label,
      start_seconds: pick.start_seconds,
      end_seconds: pick.end_seconds,
      routes: [
        {
          route_id: pick.route_id,
          buyer_label: pick.buyer_label,
          buyer_question: pick.buyer_question,
          checkout_url: pick.checkout_url
        }
      ],
      reuse_policy: "single_reusable_ii_for_same_kk_across_multiple_routes",
      duplicate_policy: "do_not_create_duplicate_ii",
      public_inventory_type: "K-KUT / HUG Moment",
      delivery_status: "needs_bookend_twinkle_materialization",
      delivery_requirements: {
        front_padding_required: true,
        back_padding_required: true,
        twinkle_required: true
      },
      admin_override_required: false
    });
  } else {
    existing.routes.push({
      route_id: pick.route_id,
      buyer_label: pick.buyer_label,
      buyer_question: pick.buyer_question,
      checkout_url: pick.checkout_url
    });
  }
}

const records = [...byKk.values()];

const registry = {
  registry: "romance-reusable-ii-records",
  status: records.length ? "ready_for_admin_audio_review" : "blocked_no_records",
  doctrine: [
    "Same KK across multiple buyer routes creates one reusable II, not duplicate II records.",
    "Buyer routes can point to the same reusable II.",
    "KK only.",
    "mKs are ADMIN override only and are not in these public records.",
    "No INSTRO.",
    "No public internal labels.",
    "Delivery audio must be materialized with front padding, back padding, and Twinkle before customer use."
  ],
  records
};

fs.writeFileSync(outJson, JSON.stringify(registry, null, 2) + "\n");

let md = "# Romance Reusable II Records\n\n";
md += `Status: ${registry.status}\n\n`;
md += "Rule: one KK can support multiple buyer routes, but it creates ONE reusable II record.\n\n";

for (const record of records) {
  md += `## ${record.public_label}\n\n`;
  md += `II: ${record.ii_id}\n\n`;
  md += `KK: ${record.kk_id}\n\n`;
  md += `Time: ${record.start_seconds}-${record.end_seconds}s\n\n`;
  md += `Routes:\n`;
  for (const route of record.routes) {
    md += `- ${route.buyer_label} (${route.route_id})\n`;
  }
  md += `\nDelivery: ${record.delivery_status}\n\n`;
}

fs.writeFileSync(outMd, md);

console.log("Romance reusable II records created.");
console.log("Records:", records.length);
console.log("JSON:", outJson);
console.log("MD:", outMd);

for (const record of records) {
  console.log(`${record.ii_id}: ${record.public_label} | routes=${record.routes.map(r => r.buyer_label).join(", ")}`);
}
