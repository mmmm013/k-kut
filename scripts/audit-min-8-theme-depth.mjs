import fs from "node:fs";

const routes = [
  "/holiday/fathers-day",
  "/personal/birthday",
  "/personal/thank-you",
  "/personal/apology",
  "/personal/encouragement",
  "/personal/hope",
  "/personal/hang-tough",
  "/personal/comfort",
  "/personal/sympathy",
  "/personal/grief",
  "/personal/memorial",
  "/personal/friendship",
  "/personal/best-friend",
  "/personal/family",
  "/personal/love",
  "/personal/missing-you"
];

const BASE = "https://www.k-kut.com";
const MIN_OPTIONS = 8;
let fail = false;

function extractAll(regex, text) {
  const out = [];
  let m;
  while ((m = regex.exec(text))) out.push(m[1]);
  return [...new Set(out)];
}

function isAudio(src) {
  return src.includes("/ii-delivery/") || src.includes(".mp3") || src.includes(".wav") || src.includes(".m4a");
}

console.log("MIN-8 THEME DEPTH AUDIT");
console.log("Required minimum distinct customer-ready II audio options:", MIN_OPTIONS);
console.log("");

for (const route of routes) {
  const url = new URL(route, BASE).toString();
  const res = await fetch(url, { cache: "no-store" }).catch((err) => ({ error: err.message, status: 0 }));

  if (!res || res.error || res.status !== 200) {
    console.error(`FAIL ${route}: page not 200 (${res?.status || 0}) ${res?.error || ""}`);
    fail = true;
    continue;
  }

  const html = await res.text();
  const srcs = extractAll(/src="([^"]+)"/g, html).filter(isAudio);
  const iiAudio = srcs
    .map((src) => src.startsWith("http") ? src : new URL(src, url).toString())
    .filter((src) => src.includes("/ii-delivery/") && src.includes("bookend-twinkle"));

  const uniqueIi = [...new Set(iiAudio)];

  const stripeLinks = extractAll(/href="([^"]+)"/g, html).filter((h) => h.includes("buy.stripe.com"));

  const status = uniqueIi.length >= MIN_OPTIONS ? "PASS" : "FAIL";
  console.log(`${status} ${route} | distinct II audio=${uniqueIi.length} | stripe=${stripeLinks.length}`);

  if (uniqueIi.length < MIN_OPTIONS) {
    console.error(`  needs ${MIN_OPTIONS - uniqueIi.length} more distinct customer-ready II option(s)`);
    fail = true;
  }

  if (!stripeLinks.length) {
    console.error("  missing Stripe link");
    fail = true;
  }
}

console.log("");

if (fail) {
  console.error("MIN-8 THEME DEPTH AUDIT: FAIL");
  process.exit(1);
}

console.log("MIN-8 THEME DEPTH AUDIT: PASS");
