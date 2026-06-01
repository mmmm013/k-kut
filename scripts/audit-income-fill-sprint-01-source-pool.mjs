import fs from "node:fs";

const p = "data/gpmc-sensory/income-fill/source-discovery/income-fill-sprint-01-source-pool.json";

let failed = false;

function fail(message) {
  console.error("FAIL:", message);
  failed = true;
}

console.log("INCOME FILL SPRINT 01 SOURCE POOL AUDIT");

if (!fs.existsSync(p)) {
  fail(`Missing ${p}`);
} else {
  const raw = fs.readFileSync(p, "utf8");
  const data = JSON.parse(raw);

  if (data.status !== "income_fill_sprint_01_source_pool") fail("Wrong status.");
  if (data.public_status !== "not_public") fail("Source pool must remain not_public.");
  if (data.buyer_exposure !== "none") fail("Buyer exposure must be none.");
  if (data.routes_created !== false) fail("Routes must not be created.");
  if (data.stripe_created !== false) fail("Stripe must not be created.");

  for (const theme of ["birthday", "encouragement_support", "friendship"]) {
    const block = data.themes?.[theme];
    if (!block) fail(`Missing theme block: ${theme}`);
    else {
      if (block.target_internal_admin_candidates !== 8) fail(`${theme} target must be 8.`);
      if (!Array.isArray(block.candidates)) fail(`${theme} candidates must be an array.`);
      for (const c of block.candidates) {
        if (c.public_status !== "not_public") fail(`${theme} candidate must remain not_public.`);
        if (c.route_created !== false) fail(`${theme} candidate must not create route.`);
        if (c.stripe_created !== false) fail(`${theme} candidate must not create Stripe.`);
        if (!Array.isArray(c.keyword_hits) || c.keyword_hits.length < 1) fail(`${theme} candidate missing keyword hits.`);
      }
    }
  }

  for (const phrase of [
    "source discovery only",
    "does not create approved candidates",
    "routes",
    "Stripe links",
    "buyer-facing records"
  ]) {
    if (!raw.includes(phrase)) fail(`Missing guard phrase: ${phrase}`);
  }
}

if (failed) {
  console.error("INCOME FILL SPRINT 01 SOURCE POOL AUDIT: FAIL");
  process.exit(1);
}

console.log("INCOME FILL SPRINT 01 SOURCE POOL AUDIT: PASS");
