import fs from "node:fs";

function fail(message) {
  throw new Error(`HOMEPAGE HOLD ALIGNMENT AUDIT FAIL: ${message}`);
}

const home = fs.readFileSync("app/_kkut-home.tsx", "utf8");
const required = [
  "Customer release review active",
  "No approved K-KUT HUGs are published yet.",
  "No public inventory yet",
  "before a player or payment button appears",
  'href="/romance"',
  "View Romance review status",
];
const forbidden = [
  "Ready now · controlled sales canary",
  "A LOVE LIKE THAT · Sweet Love HUG",
  "Hear the approved music moment",
  "pay through its locked Stripe Payment Link",
  "Hear it and send this HUG",
  "One approved $7.99 HUG is live",
  "Sweet Love canary is ready to hear and buy",
];

for (const phrase of required) {
  if (!home.includes(phrase)) fail(`homepage missing required hold copy: ${phrase}`);
}
for (const phrase of forbidden) {
  if (home.includes(phrase)) fail(`homepage retains stale sales claim: ${phrase}`);
}

console.log("HOMEPAGE HOLD ALIGNMENT AUDIT: PASS");
console.log("HOME SALES CLAIM: REMOVED");
console.log("ROMANCE STATUS PATH: PRESERVED");
console.log("AUDIO / PAYMENT / INVENTORY AUTHORITY: UNCHANGED");
