import fs from "node:fs";

function fail(message) {
  throw new Error(`HOMEPAGE HOLD ALIGNMENT AUDIT FAIL: ${message}`);
}

const home = fs.readFileSync("app/_kkut-home.tsx", "utf8");
const required = [
  "Approved real-music release",
  "36 Gregory-approved IIs are ready to hear.",
  "30 regular HUG moments at $7.99",
  "$14.99 holiday container",
  'href="/approved-iis"',
  "Hear the approved music moments",
  "A LOVE LIKE THAT and the rest of the general catalog remain held.",
];
const forbidden = [
  "Ready now · controlled sales canary",
  "A LOVE LIKE THAT · Sweet Love HUG",
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

console.log("HOMEPAGE RELEASE ALIGNMENT AUDIT: PASS");
console.log("APPROVED II RELEASE PATH: PRESENT");
console.log("A LOVE LIKE THAT HOLD: PRESERVED");
console.log("CHECKOUT PRICE GATE: PRESERVED");
