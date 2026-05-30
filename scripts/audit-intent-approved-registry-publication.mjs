import fs from "node:fs";

const helperPath = "lib/intentApprovedRegistry.ts";
const pagePath = "app/personal/[slug]/page.tsx";
const registryPath = "data/intent-approved/sympathy-registry.json";

let failed = false;

function fail(msg) {
  console.error("FAIL:", msg);
  failed = true;
}

console.log("INTENT APPROVED REGISTRY PUBLICATION AUDIT");

for (const path of [helperPath, pagePath, registryPath]) {
  if (!fs.existsSync(path)) fail(`Missing ${path}`);
}

const helper = fs.existsSync(helperPath) ? fs.readFileSync(helperPath, "utf8") : "";
const page = fs.existsSync(pagePath) ? fs.readFileSync(pagePath, "utf8") : "";
const registry = fs.existsSync(registryPath)
  ? JSON.parse(fs.readFileSync(registryPath, "utf8"))
  : {};

for (const phrase of [
  "getApprovedIntentRegistry",
  "getPublishableIntentRows",
  "human_approved === true",
  "audio_delivery_safe === true",
  "buyer_copy_safe === true",
  "receiver_risk_reviewed === true",
  "payment_allowed === true",
  "sampling_status === \"PASS\""
]) {
  if (!helper.includes(phrase)) {
    fail(`Registry helper missing gate phrase: ${phrase}`);
  }
}

if (!page.includes("No generic personal HUG cards are shown here")) {
  fail("High-risk page does not show hold state while registry is empty.");
}

if (page.includes("getPublishableIntentRows(slug)")) {
  console.log("Registry helper is already wired into page.");
} else {
  console.log("NOTE: Registry helper exists but page is still in hold-only phase.");
}

if (registry.publication_allowed !== false) {
  fail("Initial sympathy registry must keep publication_allowed false.");
}

if (!Array.isArray(registry.rows) || registry.rows.length !== 0) {
  fail("Initial sympathy registry must have zero approved rows.");
}

if (failed) {
  console.error("INTENT APPROVED REGISTRY PUBLICATION AUDIT: FAIL");
  process.exit(1);
}

console.log("INTENT APPROVED REGISTRY PUBLICATION AUDIT: PASS");
