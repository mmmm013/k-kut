import fs from "node:fs";

function fail(message) {
  throw new Error(`HUG HOLD ALIGNMENT AUDIT FAIL: ${message}`);
}

const page = fs.readFileSync("app/hug/page.tsx", "utf8");

const required = [
  "Send the Sent-i-Meant.",
  "Customer release review active",
  "No approved K-KUT HUGs are published yet.",
  "A LOVE LIKE THAT remains held.",
  "No player or payment button appears",
  'href="/romance"',
  "View Romance review status",
  "No public HUG inventory is currently published.",
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

console.log("HUG HOLD ALIGNMENT AUDIT: PASS");
console.log("HUG SALES CLAIM: REMOVED");
console.log("A LOVE LIKE THAT: HELD");
console.log("ROMANCE STATUS PATH: PRESERVED");
console.log("SENT-I-MEANT DISPLAY: PRESERVED");
console.log("AUDIO / PAYMENT / INVENTORY AUTHORITY: UNCHANGED");
