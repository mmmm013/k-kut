import fs from "node:fs";

function fail(message) {
  throw new Error(`HUG HOLD ALIGNMENT AUDIT FAIL: ${message}`);
}

const page = fs.readFileSync("app/hug/page.tsx", "utf8");

const required = [
  "Send the Sent-i-Meant.",
  "Approved real-music release",
  "36 Gregory-approved IIs are ready to hear.",
  "This release does not reopen A LOVE LIKE THAT; it remains held.",
  "exact regular or holiday Stripe price is verified",
  'href="/approved-iis"',
  "Hear the approved IIs",
  "Thirty regular HUG IIs are approved at $7.99.",
  "$14.99 holiday container",
];

const forbidden = [
  "One Sweet Love HUG is approved",
  "One approved HUG is ready now",
  "A LOVE LIKE THAT · Sweet Love · $7.99",
  "Hear it and send it",
  "purchase canary",
];

for (const phrase of required) {
  if (!page.includes(phrase)) fail(`/hug missing required hold copy: ${phrase}`);
}
for (const phrase of forbidden) {
  if (page.includes(phrase)) fail(`/hug retains stale sales claim: ${phrase}`);
}

console.log("HUG RELEASE ALIGNMENT AUDIT: PASS");
console.log("APPROVED II RELEASE PATH: PRESENT");
console.log("A LOVE LIKE THAT: HELD");
console.log("SENT-I-MEANT DISPLAY: PRESERVED");
console.log("REGULAR / HOLIDAY PRICE BOUNDARY: PRESERVED");
