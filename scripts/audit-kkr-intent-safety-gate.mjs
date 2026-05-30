import fs from "node:fs";

const doctrinePath = "docs/4pe-learning/KKR_INTENT_SAFETY_GATE.md";
const rulePath = "data/4pe/rules/kkr-intent-safety-gate.json";
const registryPath = "data/intent-approved/sympathy-registry.json";
const samplingPath = "reports/intent-sampling/sympathy-sampling-log.json";

let failed = false;

function fail(msg) {
  console.error("FAIL:", msg);
  failed = true;
}

console.log("KKR INTENT SAFETY GATE AUDIT");

for (const path of [doctrinePath, rulePath, registryPath, samplingPath]) {
  if (!fs.existsSync(path)) fail(`Missing ${path}`);
}

const doctrine = fs.existsSync(doctrinePath) ? fs.readFileSync(doctrinePath, "utf8") : "";
for (const phrase of [
  "Levels are not intent.",
  "Mood is not use-case.",
  "Slow is not sympathy.",
  "AI suggests.",
  "DISCO metadata informs.",
  "KKr scores.",
  "Human authority approves high-risk intent.",
  "BIC gate publishes."
]) {
  if (!doctrine.includes(phrase)) fail(`Doctrine missing: ${phrase}`);
}

const rule = fs.existsSync(rulePath) ? JSON.parse(fs.readFileSync(rulePath, "utf8")) : {};
for (const signal of ["heart pound", "call it love", "love like that", "spark", "romance"]) {
  if (!rule.sympathy_forbidden_signals?.includes(signal)) {
    fail(`Missing forbidden signal: ${signal}`);
  }
}

const registry = fs.existsSync(registryPath) ? JSON.parse(fs.readFileSync(registryPath, "utf8")) : {};
if (registry.publication_allowed !== false) fail("Empty sympathy registry must not allow publication.");
if (!Array.isArray(registry.rows) || registry.rows.length !== 0) fail("Initial sympathy registry must be empty.");

const sampling = fs.existsSync(samplingPath) ? JSON.parse(fs.readFileSync(samplingPath, "utf8")) : {};
for (const decision of ["PASS", "HOLD", "FAIL", "REPROCESS"]) {
  if (!sampling.allowed_sample_decisions?.includes(decision)) {
    fail(`Sampling log missing decision: ${decision}`);
  }
}

if (failed) {
  console.error("KKR INTENT SAFETY GATE AUDIT: FAIL");
  process.exit(1);
}

console.log("KKR INTENT SAFETY GATE AUDIT: PASS");
