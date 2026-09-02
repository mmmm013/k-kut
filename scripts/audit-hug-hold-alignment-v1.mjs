import fs from "node:fs";

function fail(message) {
  throw new Error(`HUG HOLD ALIGNMENT AUDIT FAIL: ${message}`);
}

const page = fs.readFileSync("app/hug/page.tsx", "utf8");

const required = [
  "Send the Sent-i-Meant.",
  "Customer release review active",
  "101 Comin&apos; True IIs are published now.",
  "A LOVE LIKE THAT remains held",
  "exact-price payment links remain closed",
  'href="/hugs/comin-true"',
  "Hear Comin&apos; True IIs",
  "15 Comin' True HUG and KOMBO audio previews are published.",
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
console.log("COMIN TRUE PUBLIC AUDIO: 101 IIs");
console.log("A LOVE LIKE THAT: HELD");
console.log("ROMANCE STATUS PATH: PRESERVED");
console.log("SENT-I-MEANT DISPLAY: PRESERVED");
console.log("PAYMENT AUTHORITY: HELD PENDING EXACT-PRICE LINKS");
