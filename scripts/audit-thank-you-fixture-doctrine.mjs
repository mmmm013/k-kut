import fs from "node:fs";

const doctrinePath = "data/system-map/thank-you-fixture-doctrine.json";

let failed = false;

function fail(message) {
  console.error("FAIL:", message);
  failed = true;
}

console.log("THANK YOU FIXTURE DOCTRINE AUDIT");

if (!fs.existsSync(doctrinePath)) {
  fail(`Missing ${doctrinePath}`);
} else {
  const doctrine = JSON.parse(fs.readFileSync(doctrinePath, "utf8"));

  for (const required of [
    "legacy_proven_theme_fixture",
    "Thank You is one proven personal/theme KK family used as a BIC proof fixture.",
    "It is not the universal K-KUT model",
    "Thank You must not be treated as the only Personal theme.",
    "Create a neutral Theme KK fixture model"
  ]) {
    if (!JSON.stringify(doctrine).includes(required)) {
      fail(`Doctrine missing required phrase: ${required}`);
    }
  }
}

const buildScript = fs.readFileSync("scripts/build-real-hug-kut-manifest.mjs", "utf8");
const bicGate = fs.readFileSync("scripts/bic-hug-gate.mjs", "utf8");

if (!buildScript.includes("public/mothers-day/thank-you/kks-expanded/manifest.json")) {
  fail("Expected existing Thank You manifest source to remain unchanged.");
}

if (!bicGate.includes("lib/hugRealKutManifest.ts")) {
  fail("Expected BIC gate to continue checking hugRealKutManifest.");
}

if (failed) {
  console.error("THANK YOU FIXTURE DOCTRINE AUDIT: FAIL");
  process.exit(1);
}

console.log("THANK YOU FIXTURE DOCTRINE AUDIT: PASS");
