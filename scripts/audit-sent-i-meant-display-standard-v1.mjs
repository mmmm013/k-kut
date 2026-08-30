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

const middleware = fs.readFileSync("middleware.ts", "utf8");
for (const required of [
  "SENTIMEANT_DEFENSIVE_HOSTS",
  'url.hostname = "sentimeant.com"',
  "NextResponse.redirect(url, 308)",
]) {
  if (!middleware.includes(required)) fail(`defensive-domain forwarding missing: ${required}`);
}
if (standard.defensive_domain_behavior?.destination !== "https://sentimeant.com") {
  fail("defensive domains must forward to canonical https://sentimeant.com");
}
if (standard.defensive_domain_behavior?.status_code !== 308) {
  fail("defensive-domain forwarding must be permanent (308)");
}
if (
  standard.defensive_domain_behavior?.preserve_path !== true ||
  standard.defensive_domain_behavior?.preserve_query !== true
) {
  fail("defensive-domain forwarding must preserve path and query");
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
console.log("DEFENSIVE DOMAINS: OWNED · 308 TO https://sentimeant.com · PATH/QUERY PRESERVED");
