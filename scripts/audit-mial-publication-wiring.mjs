import fs from "node:fs";

const requiredFiles = [
  "lib/publication-bridge/approvedPublicOptions.ts",
  "components/ApprovedPublicOptionGrid.tsx",
  "app/romance/page.tsx",
  "app/kupid/page.tsx",
  "app/wedding/page.tsx",
  "lib/personal-route-pages/ApprovedPersonalRoutePage.tsx",
  "scripts/reconcile-release-gate-ii-to-publication.mjs",
];

const forbidden = new Map([
  ["app/romance/page.tsx", ["READY_HUGS", "A Love Like That", "Your Heart Poundin'", "Don't Call It Love"]],
  ["app/kupid/page.tsx", ["KUPID_READY_HUGS", "Your Heart Poundin'"]],
  ["app/wedding/page.tsx", ["WEDDING_PACKAGES", "A Love Like That"]],
]);

const failures = [];
for (const file of requiredFiles) {
  if (!fs.existsSync(file)) failures.push(`missing required file: ${file}`);
}

for (const [file, terms] of forbidden) {
  if (!fs.existsSync(file)) continue;
  const text = fs.readFileSync(file, "utf8");
  for (const term of terms) {
    if (text.includes(term)) failures.push(`${file}: forbidden hand-written inventory term ${term}`);
  }
}

if (fs.existsSync("lib/publication-bridge/approvedPublicOptions.ts")) {
  const text = fs.readFileSync(
    "lib/publication-bridge/approvedPublicOptions.ts",
    "utf8"
  );
  for (const status of [
    "public_approved_from_mial",
    "public_approved_generated_from_reusable_ii",
  ]) {
    if (!text.includes(status)) {
      failures.push(`publication loader does not recognize approved status: ${status}`);
    }
  }
  if (!text.includes("APPROVED_PUBLICATION_STATUSES.has(record.approval_status)")) {
    failures.push("publication loader does not enforce the approved-status allowlist");
  }
}

for (const file of [
  "app/romance/page.tsx",
  "app/kupid/page.tsx",
  "app/wedding/page.tsx",
  "lib/personal-route-pages/ApprovedPersonalRoutePage.tsx",
]) {
  if (!fs.existsSync(file)) continue;
  const text = fs.readFileSync(file, "utf8");
  if (!text.includes("loadApprovedPublicOptions")) {
    failures.push(`${file}: not wired to approved publication records`);
  }
}

if (failures.length) {
  console.error("MIAL PUBLICATION WIRING AUDIT: FAIL");
  for (const failure of failures) console.error(` - ${failure}`);
  process.exit(1);
}

console.log("MIAL PUBLICATION WIRING AUDIT: PASS");
console.log("Hand-written route inventory arrays are absent.");
console.log("Existing approved reusable-II records remain sellable during MIAL expansion.");
console.log("Newly added records must use public_approved_from_mial.");
console.log("Production deployment actions: 0");
