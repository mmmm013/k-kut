import fs from "node:fs";

let failed = false;

function fail(msg) {
  console.error("FAIL:", msg);
  failed = true;
}

console.log("SYSTEM PATH NAMING RULE AUDIT");

const forbiddenPublicReviewRoots = [
  "public/mothers-day/thank-you/kks-expanded/kk8-br-controlled-review",
  "public/fathers-day",
  "public/mothers-day/controlled-review",
  "public/mothers-day/review",
  "public/mothers-day/proof"
];

for (const p of forbiddenPublicReviewRoots) {
  if (fs.existsSync(p)) {
    fail(`Forbidden named public review/proof path exists: ${p}`);
  }
}

const script = "scripts/kkr-controlled-export-thank-you-kk8-br.mjs";
if (fs.existsSync(script)) {
  const text = fs.readFileSync(script, "utf8");

  if (text.includes("public/mothers-day/thank-you/kks-expanded/kk8-br-controlled-review")) {
    fail("Controlled export script still writes review pack into mothers-day promo path.");
  }

  if (!text.includes('public/_review/kkr/thank-you-kk8-br')) {
    fail("Controlled export script does not use neutral _review path.");
  }
}

const doctrine = "docs/4pe-learning/SYSTEM_PATH_NAMING_RULE.md";
if (!fs.existsSync(doctrine)) {
  fail(`Missing ${doctrine}`);
} else {
  const text = fs.readFileSync(doctrine, "utf8");
  for (const term of [
    "Do not use customer-facing names",
    "System paths must use neutral operational naming",
    "AUDIO CAN NEVER LEAVE AN II"
  ]) {
    if (!text.includes(term)) fail(`Doctrine missing: ${term}`);
  }
}

if (failed) {
  console.error("SYSTEM PATH NAMING RULE AUDIT: FAIL");
  process.exit(1);
}

console.log("SYSTEM PATH NAMING RULE AUDIT: PASS");
