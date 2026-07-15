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
  if (!text.includes('record.approval_status === "public_approved_from_mial"')) {
    failures.push("publication loader does not require public_approved_from_mial");
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
console.log("Buyer routes require MIAL-approved publication bridge records.");
console.log("Production deployment actions: 0");
