import { execFileSync } from "node:child_process";

console.log("K-KUT PUBLIC BRIDGE ROLLUP AUDIT");

const audits = [
  "scripts/audit-publication-bridge-contract.mjs",
  "scripts/audit-public-option-records-seed.mjs",
  "scripts/audit-public-option-records-generated.mjs",
  "scripts/audit-find-bridge-wiring.mjs",
  "scripts/audit-no-public-bridge-language.mjs",
  "scripts/audit-find-more-filtering.mjs",
  "scripts/audit-find-pathway.mjs",
  "scripts/audit-audio-pathway.mjs",
  "scripts/audit-checkout-payment-pathway.mjs",
  "scripts/audit-dedicated-personal-option-pages.mjs",
  "scripts/audit-per-user-caring-history-doctrine.mjs",
  "scripts/audit-gpmc-pix-sensory-emotional-doctrine.mjs",
  "scripts/audit-thank-you-fixture-doctrine.mjs",
  "scripts/audit-approved-stripe-links-quiet.mjs"
];

let failed = false;

for (const audit of audits) {
  try {
    const output = execFileSync("node", [audit], {
      encoding: "utf8",
      maxBuffer: 1024 * 1024 * 20
    });

    const passLine = output
      .split("\n")
      .find((line) => line.includes("PASS"));

    console.log(`PASS: ${audit}${passLine ? ` — ${passLine.trim()}` : ""}`);
  } catch (error) {
    failed = true;
    console.error(`FAIL: ${audit}`);
    const stdout = error.stdout ? String(error.stdout) : "";
    const stderr = error.stderr ? String(error.stderr) : "";
    console.error((stdout + "\n" + stderr).slice(-4000));
  }
}

if (failed) {
  console.error("K-KUT PUBLIC BRIDGE ROLLUP AUDIT: FAIL");
  process.exit(1);
}

console.log("K-KUT PUBLIC BRIDGE ROLLUP AUDIT: PASS");
