import fs from "node:fs";

const generatedPath = "data/publication-bridge/public-option-records.generated.json";
const decisionsPath = "data/gpmc-sensory/review-decisions/thank-you-gratitude-internal-approval-decisions.json";

const themes = [
  "gratitude_thank_you",
  "romance_love",
  "wedding_forever",
  "anniversary",
  "apology_repair",
  "birthday",
  "friendship",
  "encouragement_support",
  "missing_you",
  "family_parent",
  "mentor_recognition",
  "grief_remembrance",
  "kupid_spark"
];

function readJson(path, fallback) {
  if (!fs.existsSync(path)) return fallback;
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

const publicRecords = readJson(generatedPath, { records: [] }).records || [];
const internalDecisions = readJson(decisionsPath, { decisions: [] }).decisions || [];

function classifyPublicTheme(record) {
  const text = JSON.stringify(record).toLowerCase();

  if (text.includes("wedding")) return "wedding_forever";
  if (text.includes("anniversary")) return "anniversary";
  if (text.includes("apology") || text.includes("repair")) return "apology_repair";
  if (text.includes("kupid") || text.includes("spark")) return "kupid_spark";
  if (text.includes("love") || text.includes("romance")) return "romance_love";
  return "uncategorized_public";
}

const themeRows = themes.map((theme) => {
  const approvedPublic = publicRecords.filter((r) => classifyPublicTheme(r) === theme);
  const internalReady =
    theme === "gratitude_thank_you"
      ? internalDecisions.filter((d) => d.human_decision === "approve_internal")
      : [];

  const totalAdminCandidates = approvedPublic.length + internalReady.length;

  let stockStatus = "NEEDS_MORE_CURATION";
  if (theme === "grief_remembrance") stockStatus = "HELD_HIGH_RISK";
  else if (approvedPublic.length >= 8) stockStatus = "STOCKED_PUBLIC_BIC";
  else if (approvedPublic.length >= 3) stockStatus = "STOCKED_PUBLIC_MINIMUM";
  else if (totalAdminCandidates >= 8) stockStatus = "STOCKED_INTERNAL";
  else if (totalAdminCandidates > 0) stockStatus = "PARTIAL_STOCK";

  return {
    theme,
    approved_public_count: approvedPublic.length,
    internal_ready_count: internalReady.length,
    total_admin_candidate_count: totalAdminCandidates,
    target_admin_minimum: 8,
    target_public_minimum: 3,
    target_public_bic: 8,
    stock_status: stockStatus,
    next_action:
      stockStatus === "STOCKED_INTERNAL"
        ? "Review for possible public promotion, one controlled lane at a time."
        : stockStatus === "PARTIAL_STOCK"
          ? "Batch-curate more internal candidates."
          : stockStatus === "HELD_HIGH_RISK"
            ? "Keep held until grief-specific safety review exists."
            : "Needs candidate generation from all KKs."
  };
});

const output = {
  status: "full_theme_stock_audit",
  name: "Full Theme Stock Audit",
  generated_at: new Date().toISOString(),
  rules: {
    admin_minimum_per_theme: 8,
    public_minimum_per_commercial_theme: 3,
    public_bic_per_major_theme: 8,
    public_buyer_rule: "Only approved_public records may reach buyer-facing routes.",
    internal_rule: "Internal-ready records may support admin search and review but not public routes or Stripe."
  },
  counts: {
    themes_checked: themeRows.length,
    public_records_available: publicRecords.length,
    internal_approval_decisions_available: internalDecisions.length
  },
  themes: themeRows
};

fs.writeFileSync(
  "data/gpmc-sensory/audits/full-theme-stock-audit.json",
  JSON.stringify(output, null, 2) + "\n"
);

console.log("FULL THEME STOCK AUDIT");
console.log(`themes_checked: ${themeRows.length}`);
console.log(`public_records_available: ${publicRecords.length}`);
console.log(`internal_approval_decisions_available: ${internalDecisions.length}`);
console.log("");

for (const row of themeRows) {
  console.log(`${row.theme}: public=${row.approved_public_count} internal=${row.internal_ready_count} total=${row.total_admin_candidate_count} status=${row.stock_status}`);
}
