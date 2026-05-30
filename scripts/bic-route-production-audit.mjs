import fs from "node:fs";

const BASE_URL = "https://www.k-kut.com";
const configPath = "data/bic-routes/routes.json";
const onlyRoute = process.argv[2] || "";

const FORBIDDEN_TEXT = [
  "Music Maykers",
  "LT-PIX",
  "mini-KUT",
  "raw KK",
  "instrumental",
  "instro"
];

if (!fs.existsSync(configPath)) {
  console.error("Missing config:", configPath);
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const routes = onlyRoute
  ? config.routes.filter((r) => r.route === onlyRoute || r.name.toLowerCase() === onlyRoute.toLowerCase())
  : config.routes;

if (!routes.length) {
  console.error("No matching BIC route config for:", onlyRoute);
  process.exit(1);
}

async function headOrGet(url) {
  let res = await fetch(url, { method: "HEAD", redirect: "manual" }).catch(() => null);
  if (!res || res.status === 405 || res.status === 403) {
    res = await fetch(url, { method: "GET", redirect: "manual" }).catch(() => null);
  }
  return res;
}

function extractAll(re, text) {
  const out = [];
  let m;
  while ((m = re.exec(text))) out.push(m[1]);
  return [...new Set(out)];
}

async function auditRoute(routeConfig) {
  let failed = false;
  const pageUrl = new URL(routeConfig.route, BASE_URL).toString();

  function fail(msg) {
    console.error("FAIL:", msg);
    failed = true;
  }

  console.log("");
  console.log(`BIC ${routeConfig.name} PRODUCTION AUDIT`);
  console.log("PAGE:", pageUrl);

  const pageRes = await fetch(pageUrl, { cache: "no-store" }).catch((err) => {
    fail(`Page fetch error: ${err.message}`);
    return null;
  });

  if (!pageRes) return false;

  console.log("PAGE STATUS:", pageRes.status, pageRes.headers.get("content-type") || "");

  if (pageRes.status !== 200) {
    fail(`Page is not 200: ${pageRes.status}`);
    return false;
  }

  const html = await pageRes.text();

  console.log("");
  console.log("---- REQUIRED TEXT ----");
  for (const txt of routeConfig.requiredText || []) {
    if (html.toLowerCase().includes(String(txt).toLowerCase())) {
      console.log("OK", txt);
    } else {
      fail(`Missing required text: ${txt}`);
    }
  }

  console.log("");
  console.log("---- FORBIDDEN TEXT ----");
  for (const txt of FORBIDDEN_TEXT) {
    if (html.toLowerCase().includes(txt.toLowerCase())) {
      fail(`Forbidden public text found: ${txt}`);
    } else {
      console.log("OK absent:", txt);
    }
  }

  const hrefs = extractAll(/href="([^"]+)"/g, html);
  const srcs = extractAll(/src="([^"]+)"/g, html);

  console.log("");
  console.log("---- EXPECTED AUDIO URLS ----");
  if (!(routeConfig.expectedAudio || []).length) {
    fail("No expected audio configured.");
  }
  for (const url of routeConfig.expectedAudio || []) {
    const res = await headOrGet(url);
    if (!res) {
      fail(`Expected audio failed: ${url}`);
      continue;
    }
    const contentType = res.headers.get("content-type") || "";
    console.log(res.status, contentType, url);
    if (res.status !== 200) fail(`Expected audio not 200: ${url}`);
    if (!contentType.includes("audio")) fail(`Expected audio content-type not audio: ${url}`);
  }

  console.log("");
  console.log("---- EXPECTED STRIPE URLS ----");
  if (!(routeConfig.expectedStripe || []).length) {
    fail("No expected Stripe configured.");
  }
  for (const url of routeConfig.expectedStripe || []) {
    const res = await headOrGet(url);
    if (!res) {
      fail(`Expected Stripe failed: ${url}`);
      continue;
    }
    const contentType = res.headers.get("content-type") || "";
    console.log(res.status, contentType, url);
    if (![200, 301, 302, 303, 307, 308].includes(res.status)) {
      fail(`Expected Stripe bad status ${res.status}: ${url}`);
    }
  }

  console.log("");
  console.log("---- PAGE-LINK CHECK ----");
  for (const href of hrefs) {
    if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) continue;

    const url = href.startsWith("http") ? href : new URL(href, pageUrl).toString();
    const res = await headOrGet(url);

    if (!res) {
      fail(`Link failed: ${url}`);
      continue;
    }

    console.log(res.status, url);

    if (![200, 301, 302, 303, 307, 308].includes(res.status)) {
      fail(`Link bad status ${res.status}: ${url}`);
    }
  }

  console.log("");
  console.log("---- AUDIO SRC CHECK ----");
  const audioSrcs = srcs.filter((s) =>
    s.includes(".mp3") || s.includes(".wav") || s.includes(".m4a") || s.includes("/ii-delivery/")
  );

  if (!audioSrcs.length) {
    fail(`No customer audio sources found on ${routeConfig.route}.`);
  }

  for (const src of audioSrcs) {
    const url = src.startsWith("http") ? src : new URL(src, pageUrl).toString();
    const res = await headOrGet(url);

    if (!res) {
      fail(`Audio src failed: ${url}`);
      continue;
    }

    const contentType = res.headers.get("content-type") || "";
    console.log(res.status, contentType, url);

    if (res.status !== 200) fail(`Audio src not 200: ${url}`);
    if (!contentType.includes("audio")) fail(`Audio src content-type not audio: ${url}`);
  }

  console.log("");
  console.log(failed ? `BIC ${routeConfig.name} PRODUCTION AUDIT: FAIL` : `BIC ${routeConfig.name} PRODUCTION AUDIT: PASS`);
  return !failed;
}

let allPass = true;

for (const route of routes) {
  const ok = await auditRoute(route);
  if (!ok) allPass = false;
}

if (!allPass) process.exit(1);

console.log("");
console.log("BIC ROUTE PRODUCTION AUDITS: PASS");
