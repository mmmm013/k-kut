import fs from "node:fs";

let failed = false;

function fail(msg) {
  console.error("FAIL:", msg);
  failed = true;
}

function mustContain(file, terms) {
  if (!fs.existsSync(file)) {
    fail(`Missing file: ${file}`);
    return;
  }

  const text = fs.readFileSync(file, "utf8");

  for (const term of terms) {
    if (!text.includes(term)) fail(`${file} missing required term: ${term}`);
  }
}

console.log("DP / CI DELIVERY REQUEST GATE AUDIT");

mustContain("docs/4pe-learning/DP_CI_DELIVERY_REQUEST_GATE_RULE.md", [
  "4PE-BIZ-KKr",
  "LT-PIX",
  "KK",
  "II",
  "CI means Cost Item",
  "DP means Delivery Package",
  "Incoming user requests cue DP selection.",
  "Payment finalizes DP.",
  "DMAIC",
  "AUDIO CAN NEVER LEAVE AN II",
  "No public CI without a finished II"
]);

mustContain("data/delivery/dp-ci-delivery-gate.json", [
  "locked_delivery_model",
  "4PE-BIZ-KKr",
  "Cost Item",
  "Delivery Package",
  "buyer intent captured",
  "payment confirmed",
  "fulfillment proof recorded",
  "production audit",
  "finished-II audit",
  "depth audit"
]);

if (failed) {
  console.error("");
  console.error("DP / CI DELIVERY REQUEST GATE AUDIT: FAIL");
  process.exit(1);
}

console.log("DP / CI DELIVERY REQUEST GATE AUDIT: PASS");
