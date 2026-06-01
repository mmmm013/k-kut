import fs from "node:fs";

const p = "data/gpmc-sensory/audits/full-theme-stock-audit.json";

let failed = false;

function fail(message) {
  console.error("FAIL:", message);
  failed = true;
}

console.log("FULL THEME STOCK AUDIT OUTPUT AUDIT");

if (!fs.existsSync(p)) {
  fail(`Missing ${p}`);
} else {
  const raw = fs.readFileSync(p, "utf8");
  const data = JSON.parse(raw);
  const themes = data.themes || [];

  if (data.status !== "full_theme_stock_audit") fail("Wrong status.");
  if (themes.length < 10) fail(`Expected at least 10 themes, found ${themes.length}.`);

  for (const phrase of [
    "Only approved_public records may reach buyer-facing routes.",
    "Internal-ready records may support admin search and review but not public routes or Stripe."
  ]) {
    if (!raw.includes(phrase)) fail(`Missing guard phrase: ${phrase}`);
  }

  for (const row of themes) {
    for (const field of [
      "theme",
      "approved_public_count",
      "internal_ready_count",
      "total_admin_candidate_count",
      "target_admin_minimum",
      "stock_status",
      "next_action"
    ]) {
      if (!(field in row)) fail(`${row.theme || "unknown"} missing ${field}.`);
    }

    if (row.target_admin_minimum !== 8) {
      fail(`${row.theme} must target 8 admin candidates.`);
    }

    if (
      row.stock_status === "STOCKED_PUBLIC_BIC" &&
      row.approved_public_count < 8
    ) {
      fail(`${row.theme} cannot be STOCKED_PUBLIC_BIC with fewer than 8 public records.`);
    }

    if (
      row.stock_status === "STOCKED_INTERNAL" &&
      row.total_admin_candidate_count < 8
    ) {
      fail(`${row.theme} cannot be STOCKED_INTERNAL with fewer than 8 total candidates.`);
    }
  }
}

if (failed) {
  console.error("FULL THEME STOCK AUDIT OUTPUT AUDIT: FAIL");
  process.exit(1);
}

console.log("FULL THEME STOCK AUDIT OUTPUT AUDIT: PASS");
