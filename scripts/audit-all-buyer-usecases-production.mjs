import fs from "node:fs";

const BASE = "https://www.k-kut.com";
const OUT_JSON = "reports/end-to-end/all-buyer-usecases-production-audit.json";
const OUT_MD = "reports/end-to-end/all-buyer-usecases-production-audit.md";

const ROUTES = [
  "/personal",
  "/personal/birthday",
  "/personal/thank-you",
  "/personal/apology",
  "/personal/encouragement",
  "/personal/thinking-of-you",
  "/personal/just-because",
  "/personal/love",
  "/personal/missing-you",
  "/personal/new-baby",
  "/personal/graduation",
  "/personal/retirement",
  "/personal/congratulations",
  "/personal/comfort",
  "/personal/sympathy",
  "/personal/grief",
  "/personal/memorial",
  "/personal/celebration-of-life",
  "/personal/get-well",
  "/personal/recovery",
  "/personal/hang-tough",
  "/personal/hope",
  "/personal/self-esteem",
  "/personal/friendship",
  "/personal/best-friend",
  "/personal/family",
  "/holiday",
  "/holiday/fathers-day",
  "/holiday/mothers-day",
  "/holiday/memorial-day",
  "/holiday/flag-day",
  "/holiday/juneteenth",
  "/holiday/independence-day",
  "/holiday/labor-day",
  "/holiday/grandparents-day",
  "/holiday/thanksgiving",
  "/holiday/christmas",
  "/romance",
  "/kupid",
  "/wedding"
];

const FORBIDDEN = [
  "Music Maykers",
  "LT-PIX",
  "mini-KUT",
  "raw KK",
  "instrumental",
  "instro",
  "Connect approved birthday audio source here",
  "Do not preload bulk audio"
];

const BUY_INTENT = [
  "send this",
  "checkout",
  "buy",
  "order",
  "pay",
  "send a",
  "hug"
];

function urlFor(route) {
  return new URL(route, BASE).toString();
}

async function fetchWithTimeout(url, options = {}, ms = 12000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      redirect: "follow",
      cache: "no-store"
    });
    clearTimeout(timer);
    return res;
  } catch (err) {
    clearTimeout(timer);
    return { error: err?.message || "fetch failed", status: 0, headers: new Map() };
  }
}

function getHeader(res, name) {
  if (!res || !res.headers) return "";
  if (typeof res.headers.get === "function") return res.headers.get(name) || "";
  return "";
}

function extractAll(regex, text) {
  const out = [];
  let m;
  while ((m = regex.exec(text))) out.push(m[1]);
  return [...new Set(out)];
}

function isAudioSrc(src) {
  return (
    src.includes(".mp3") ||
    src.includes(".wav") ||
    src.includes(".m4a") ||
    src.includes("/ii-delivery/")
  );
}

function hasBuyIntent(html, stripeLinks) {
  const low = html.toLowerCase();
  return stripeLinks.length > 0 || BUY_INTENT.some((x) => low.includes(x));
}

async function checkUrl(url, kind) {
  const res = await fetchWithTimeout(url, { method: "HEAD" }, 10000);

  if (res?.status === 405 || res?.status === 403 || res?.status === 0) {
    const getRes = await fetchWithTimeout(url, { method: "GET" }, 12000);
    return {
      kind,
      url,
      status: getRes.status || 0,
      contentType: getHeader(getRes, "content-type"),
      error: getRes.error || ""
    };
  }

  return {
    kind,
    url,
    status: res.status || 0,
    contentType: getHeader(res, "content-type"),
    error: res.error || ""
  };
}

async function auditRoute(route) {
  const pageUrl = urlFor(route);
  const failures = [];
  const warnings = [];

  const pageRes = await fetchWithTimeout(pageUrl, { method: "GET" }, 15000);

  if (pageRes.error || pageRes.status !== 200) {
    failures.push(`Page not 200: ${pageRes.status || 0} ${pageRes.error || ""}`.trim());
    return { route, status: pageRes.status || 0, failures, warnings, audio: [], stripe: [], linksChecked: [] };
  }

  const html = await pageRes.text();
  const low = html.toLowerCase();

  for (const term of FORBIDDEN) {
    if (low.includes(term.toLowerCase())) {
      failures.push(`Forbidden / placeholder public text found: ${term}`);
    }
  }

  const hrefs = extractAll(/href="([^"]+)"/g, html);
  const srcs = extractAll(/src="([^"]+)"/g, html);

  const stripe = hrefs.filter((h) => h.includes("buy.stripe.com"));
  const audio = srcs.filter(isAudioSrc);

  const buyerPage = hasBuyIntent(html, stripe);

  if (buyerPage && !route.startsWith("/asset-drop") && audio.length === 0) {
    failures.push("BUYER PAGE FAIL: send/buy/checkout/HUG intent but no audio src.");
  }

  for (const src of audio) {
    const full = src.startsWith("http") ? src : new URL(src, pageUrl).toString();

    if (!full.includes("/ii-delivery/")) {
      failures.push(`AUDIO LAW FAIL: audio is not /ii-delivery/: ${full}`);
    }

    if (!full.includes("bookend-twinkle")) {
      failures.push(`AUDIO LAW FAIL: II audio missing bookend-twinkle marker: ${full}`);
    }

    const check = await checkUrl(full, "audio");
    if (check.status !== 200) failures.push(`Audio not 200: ${check.status} ${full}`);
    if (!check.contentType.includes("audio")) failures.push(`Audio content-type not audio: ${check.contentType} ${full}`);
  }

  for (const link of stripe) {
    const check = await checkUrl(link, "stripe");
    if (![200, 301, 302, 303, 307, 308].includes(check.status)) {
      failures.push(`Stripe bad status: ${check.status} ${link}`);
    }
  }

  if (buyerPage && stripe.length === 0 && !route.startsWith("/hug")) {
    warnings.push("Buyer/HUG language present but no Stripe link on this page.");
  }

  return {
    route,
    status: pageRes.status,
    failures,
    warnings,
    audio,
    stripe
  };
}

fs.mkdirSync("reports/end-to-end", { recursive: true });

console.log("ALL BUYER USE CASES PRODUCTION AUDIT");
console.log("Routes:", ROUTES.length);

const results = [];

for (const route of ROUTES) {
  process.stdout.write(`Checking ${route} ... `);
  const result = await auditRoute(route);
  results.push(result);
  console.log(result.failures.length ? "FAIL" : "PASS");
}

const failed = results.filter((r) => r.failures.length);
const warned = results.filter((r) => r.warnings.length);

const report = {
  date: new Date().toISOString(),
  status: failed.length ? "FAIL" : "PASS",
  rule: "AUDIO CAN NEVER LEAVE AN II. Public buyer audio must be /ii-delivery/*bookend-twinkle*.",
  routesAudited: results.length,
  failedRoutes: failed.length,
  warnedRoutes: warned.length,
  results
};

fs.writeFileSync(OUT_JSON, JSON.stringify(report, null, 2) + "\n");

let md = "# All Buyer Use Cases Production Audit\n\n";
md += `Status: ${report.status}\n\n`;
md += "Rule: AUDIO CAN NEVER LEAVE AN II. Public buyer audio must be `/ii-delivery/*bookend-twinkle*`.\n\n";
md += `- Routes audited: ${report.routesAudited}\n`;
md += `- Failed routes: ${report.failedRoutes}\n`;
md += `- Warned routes: ${report.warnedRoutes}\n\n`;

if (failed.length) {
  md += "## FAILURES\n\n";
  for (const r of failed) {
    md += `### ${r.route}\n`;
    for (const f of r.failures) md += `- ${f}\n`;
    md += "\n";
  }
}

if (warned.length) {
  md += "## WARNINGS\n\n";
  for (const r of warned) {
    md += `### ${r.route}\n`;
    for (const w of r.warnings) md += `- ${w}\n`;
    md += "\n";
  }
}

md += "## Route Summary\n\n";
for (const r of results) {
  md += `- ${r.failures.length ? "FAIL" : "PASS"} ${r.route} | audio=${r.audio.length} | stripe=${r.stripe.length}\n`;
}

fs.writeFileSync(OUT_MD, md);

console.log("");
console.log("Status:", report.status);
console.log("Failed routes:", failed.length);
console.log("Warned routes:", warned.length);
console.log("MD:", OUT_MD);

if (failed.length) process.exit(1);

console.log("ALL BUYER USE CASES PRODUCTION AUDIT: PASS");
