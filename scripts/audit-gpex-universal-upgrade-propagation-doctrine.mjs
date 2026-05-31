import fs from "node:fs";

const doctrinePath = "data/system-map/gpex-universal-upgrade-propagation-doctrine.json";

let failed = false;

function fail(message) {
  console.error("FAIL:", message);
  failed = true;
}

console.log("GPEX UNIVERSAL UPGRADE PROPAGATION DOCTRINE AUDIT");

if (!fs.existsSync(doctrinePath)) {
  fail(`Missing ${doctrinePath}`);
} else {
  const raw = fs.readFileSync(doctrinePath, "utf8");
  const data = JSON.parse(raw);

  for (const phrase of [
    "One truth improves. All dependent systems learn. Nothing buyer-facing changes until audited.",
    "Healthy is purposeful.",
    "Technical propagation must never outrun human care.",
    "Buyer-facing surfaces receive only approved, audited, route-safe, human-meaningful improvements.",
    "BIC-level conventions must become reusable enterprise doctrine, not one-off patches.",
    "No public bridge language",
    "No mKs in buyer flow",
    "Revenue is allowed. Harm is not.",
    "Remember to care better. Never remember to manipulate."
  ]) {
    if (!raw.includes(phrase)) fail(`Missing required phrase: ${phrase}`);
  }

  for (const required of [
    "GPEx",
    "4PE",
    "GPMC",
    "K-KUT",
    "KKr",
    "PIX",
    "PIX MetaGrab",
    "Buyer Flow",
    "HUG"
  ]) {
    if (!data.scope.includes(required)) fail(`Missing scope item: ${required}`);
  }

  for (const lane of [
    "doctrine",
    "data_shape",
    "audit",
    "buyer_flow",
    "sensory_interpretation",
    "platform_process"
  ]) {
    if (!(lane in data.propagation_lanes)) {
      fail(`Missing propagation lane: ${lane}`);
    }
  }

  for (const forbidden of [
    "raw inventory",
    "unreviewed emotional candidates",
    "grief-related records",
    "private user history",
    "receiver assumptions",
    "mKs into buyer flow",
    "internal proof language"
  ]) {
    if (!raw.includes(forbidden)) {
      fail(`Missing do-not-propagate guard: ${forbidden}`);
    }
  }
}

if (failed) {
  console.error("GPEX UNIVERSAL UPGRADE PROPAGATION DOCTRINE AUDIT: FAIL");
  process.exit(1);
}

console.log("GPEX UNIVERSAL UPGRADE PROPAGATION DOCTRINE AUDIT: PASS");
