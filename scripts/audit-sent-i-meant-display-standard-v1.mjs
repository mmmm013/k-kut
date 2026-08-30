import fs from "node:fs";

const fail = (message) => {
  throw new Error(`SENT-I-MEANT DISPLAY STANDARD AUDIT FAIL: ${message}`);
};

const standard = JSON.parse(
  fs.readFileSync("config/sent-i-meant-display-standard.v1.json", "utf8")
);

if (standard.default_public_display !== "Sent-i-Meant") {
  fail("default public display must be exactly Sent-i-Meant");
}
if (standard.immutable !== false) {
  fail("display standard must remain non-immutable");
}
if (standard.marketing_variants_require_explicit_approval !== true) {
  fail("marketing variants must require explicit approval");
}
if (standard.technical_identifiers_unchanged !== true) {
  fail("technical identifiers must remain unchanged");
}
for (const host of ["sentimeant.com", "www.sentimeant.com", "sentimeants.com", "www.sentimeants.com"]) {
  const layout = fs.readFileSync("app/layout.tsx", "utf8");
  if (!layout.includes(`'${host}'`)) fail(`technical hostname missing: ${host}`);
}

const publicFiles = [
  "app/_sentimeant-home.tsx",
  "app/_kkut-home.tsx",
  "app/hug/page.tsx",
  "app/layout.tsx",
  "lib/publicDomainIdentity.ts",
];

for (const path of publicFiles) {
  const source = fs.readFileSync(path, "utf8");
  for (const legacy of ["Sent-i-Meants", "Send the sentimeant."]) {
    if (source.includes(legacy)) fail(`${path} contains legacy public display: ${legacy}`);
  }
}

const sentimeantHome = fs.readFileSync("app/_sentimeant-home.tsx", "utf8");
if (!sentimeantHome.includes("Sent-i-Meant | Semantic Match Hold")) {
  fail("Sent-i-Meant metadata title is missing");
}
if (!sentimeantHome.includes("Sent-i-Meant · K-KUT · G Putnam Music")) {
  fail("Sent-i-Meant landing identity is missing");
}

for (const path of ["app/_kkut-home.tsx", "app/hug/page.tsx"]) {
  const source = fs.readFileSync(path, "utf8");
  if (!source.includes("Send the Sent-i-Meant.")) {
    fail(`${path} is missing the standard headline`);
  }
}

const identity = fs.readFileSync("lib/publicDomainIdentity.ts", "utf8");
if (!identity.includes('publicName: "Sent-i-Meant"')) {
  fail("host-aware public identity is missing");
}

console.log("SENT-I-MEANT DISPLAY STANDARD AUDIT: PASS");
console.log("DEFAULT PUBLIC DISPLAY: Sent-i-Meant");
console.log("IMMUTABLE: false");
console.log("MARKETING VARIANTS: EXPLICIT APPROVAL REQUIRED");
console.log("TECHNICAL IDENTIFIERS AND DEFENSIVE DOMAINS: UNCHANGED");
