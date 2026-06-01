import fs from "node:fs";

const stockPath = "data/gpmc-sensory/audits/full-theme-stock-audit.json";
const outputPath = "data/gpmc-sensory/plans/minimum-8-admin-candidate-plan.json";

const stock = JSON.parse(fs.readFileSync(stockPath, "utf8"));
const themes = stock.themes || [];

const incomePriority = [
  "birthday",
  "encouragement_support",
  "friendship",
  "romance_love",
  "anniversary",
  "wedding_forever",
  "apology_repair",
  "family_parent",
  "mentor_recognition",
  "missing_you",
  "kupid_spark",
  "gratitude_thank_you"
];

function priorityFor(theme) {
  const i = incomePriority.indexOf(theme);
  return i === -1 ? 999 : i + 1;
}

function themeAction(theme, deficit, status) {
  if (status === "HELD_HIGH_RISK") {
    return "Hold. Do not batch-promote until high-risk safety review exists.";
  }

  if (deficit <= 0) {
    return "No admin-fill required. Consider controlled public-promotion review only.";
  }

  return `Generate ${deficit} additional admin KK candidates from all available KKs, preserving DUP rules, emotional levels, and XML-armed fields.`;
}

const targetAdminMinimum = 8;

const planRows = themes
  .filter((row) => row.theme !== "grief_remembrance")
  .map((row) => {
    const deficit = Math.max(0, targetAdminMinimum - row.total_admin_candidate_count);

    let planStatus = "NO_FILL_NEEDED";
    if (deficit > 0 && row.total_admin_candidate_count === 0) planStatus = "EMPTY_FILL_REQUIRED";
    else if (deficit > 0) planStatus = "PARTIAL_FILL_REQUIRED";
    else if (row.stock_status === "STOCKED_INTERNAL") planStatus = "INTERNAL_STOCK_READY";

    return {
      theme: row.theme,
      income_priority_rank: priorityFor(row.theme),
      approved_public_count: row.approved_public_count,
      internal_ready_count: row.internal_ready_count,
      total_admin_candidate_count: row.total_admin_candidate_count,
      target_admin_minimum: targetAdminMinimum,
      admin_candidate_deficit: deficit,
      current_stock_status: row.stock_status,
      plan_status: planStatus,
      source_scope: "all_KKs",
      public_status_after_plan: "not_public",
      public_route_after_plan: null,
      stripe_url_after_plan: null,
      required_candidate_fields: [
        "record_id",
        "source_id",
        "source_type",
        "source_title",
        "candidate_type",
        "lane_id",
        "surface_feeling",
        "deeper_feelings",
        "emotional_level",
        "sensory_profile",
        "good_use_cases",
        "bad_use_cases",
        "risk_notes",
        "review_status",
        "public_status",
        "public_route",
        "audio_delivery_url",
        "do_not_say"
      ],
      generation_instruction: themeAction(row.theme, deficit, row.stock_status)
    };
  })
  .sort((a, b) => {
    if (a.admin_candidate_deficit === 0 && b.admin_candidate_deficit > 0) return 1;
    if (a.admin_candidate_deficit > 0 && b.admin_candidate_deficit === 0) return -1;
    return a.income_priority_rank - b.income_priority_rank;
  });

const output = {
  status: "minimum_8_admin_candidate_plan",
  name: "Minimum 8 Admin Candidate Plan",
  source_stock_audit: stockPath,
  target_admin_minimum_per_theme: targetAdminMinimum,
  public_buyer_rule: "This plan does not publish records, create routes, create Stripe links, or expose candidates in buyer flow.",
  generation_rule: "Use all KKs as source scope, but generated records remain internal until separate review and approved_public promotion.",
  dup_rule: "DUPs are allowed. Best reviewed candidate wins when same. Ties may remain internal. Emotional levels must convene.",
  xml_rule: "Planned candidate records must be XML-armed before wider GPEx propagation.",
  income_rule: "Fill income lanes first so admin can sell without waiting for public-theme perfection.",
  count: planRows.length,
  total_admin_candidate_deficit: planRows.reduce((sum, row) => sum + row.admin_candidate_deficit, 0),
  plan: planRows
};

fs.writeFileSync(outputPath, JSON.stringify(output, null, 2) + "\n");

console.log("MINIMUM 8 ADMIN CANDIDATE PLAN");
console.log(`themes_planned: ${planRows.length}`);
console.log(`total_admin_candidate_deficit: ${output.total_admin_candidate_deficit}`);
console.log("");

for (const row of planRows) {
  console.log(`${row.theme}: current=${row.total_admin_candidate_count} deficit=${row.admin_candidate_deficit} status=${row.plan_status}`);
}
