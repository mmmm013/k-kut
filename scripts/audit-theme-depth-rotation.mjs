const BASE = "https://www.k-kut.com";

const PERSONAL_MIN = 8;
const ACTIVE_HOLIDAY_MIN = 8;
const OFFSEASON_HOLIDAY_MIN = 2;

const personalRoutes = [
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

const activeHolidayRoutes = [
  "/holiday/fathers-day"
];

const offSeasonHolidayRoutes = [
  "/holiday/mothers-day",
  "/holiday/memorial-day",
  "/holiday/flag-day",
  "/holiday/juneteenth",
  "/holiday/independence-day",
  "/holiday/labor-day",
  "/holiday/grandparents-day",
  "/holiday/thanksgiving",
  "/holiday/christmas"
];

function extractAll(regex, text) {
  const out = [];
  let m;
  while ((m = regex.exec(text))) out.push(m[1]);
  return [...new Set(out)];
}

function isAudio(src) {
  return src.includes("/ii-delivery/") || src.includes(".mp3") || src.includes(".wav") || src.includes(".m4a");
}

async function auditRoute(route, min, category) {
  const url = new URL(route, BASE).toString();
  const res = await fetch(url, { cache: "no-store" }).catch((err) => ({
    error: err.message,
    status: 0
  }));

  if (!res || res.error || res.status !== 200) {
    return {
      route,
      category,
      status: "FAIL",
      distinctIi: 0,
      stripe: 0,
      failures: [`Page not 200: ${res?.status || 0} ${res?.error || ""}`]
    };
  }

  const html = await res.text();
  const srcs = extractAll(/src="([^"]+)"/g, html).filter(isAudio);

  const iiAudio = srcs
    .map((src) => (src.startsWith("http") ? src : new URL(src, url).toString()))
    .filter((src) => src.includes("/ii-delivery/") && src.includes("bookend-twinkle"));

  const uniqueIi = [...new Set(iiAudio)];
  const stripeLinks = extractAll(/href="([^"]+)"/g, html).filter((h) => h.includes("buy.stripe.com"));

  const failures = [];

  if (uniqueIi.length < min) {
    failures.push(`Needs ${min - uniqueIi.length} more distinct customer-ready II option(s).`);
  }

  if (!stripeLinks.length) {
    failures.push("Missing Stripe link.");
  }

  return {
    route,
    category,
    status: failures.length ? "FAIL" : "PASS",
    distinctIi: uniqueIi.length,
    stripe: stripeLinks.length,
    min,
    failures
  };
}

console.log("THEME DEPTH ROTATION AUDIT");
console.log("Personal MIN:", PERSONAL_MIN);
console.log("Active holiday MIN:", ACTIVE_HOLIDAY_MIN);
console.log("Off-season holiday starter MIN:", OFFSEASON_HOLIDAY_MIN);
console.log("");

const results = [];

for (const route of personalRoutes) {
  results.push(await auditRoute(route, PERSONAL_MIN, "PERSONAL_STRICT_MIN_8"));
}

for (const route of activeHolidayRoutes) {
  const result = await auditRoute(route, ACTIVE_HOLIDAY_MIN, "ACTIVE_HOLIDAY_MIN_8_TARGET");
  if (result.failures.length) {
    result.warnings = [...(result.warnings || []), ...result.failures];
    result.failures = [];
    result.status = "WARN";
  }
  results.push(result);
}

for (const route of offSeasonHolidayRoutes) {
  results.push(await auditRoute(route, OFFSEASON_HOLIDAY_MIN, "OFFSEASON_HOLIDAY_SAFE_STARTER"));
}

let failed = false;

for (const r of results) {
  console.log(`${r.status} ${r.category} ${r.route} | distinct II=${r.distinctIi} | stripe=${r.stripe} | min=${r.min}`);

  for (const failure of r.failures) {
    console.log(`  ${failure}`);
  }

  for (const warning of r.warnings || []) {
    console.log(`  WARN: ${warning}`);
  }

  if (r.failures.length) failed = true;
}

console.log("");

if (failed) {
  console.error("THEME DEPTH ROTATION AUDIT: FAIL");
  process.exit(1);
}

console.log("THEME DEPTH ROTATION AUDIT: PASS");
