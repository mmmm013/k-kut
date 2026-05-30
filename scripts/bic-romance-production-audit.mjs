const PAGE_URL = "https://www.k-kut.com/romance";

const EXPECTED_AUDIO = [
  "https://www.k-kut.com/ii-delivery/romance/a-love-like-that-d3dfd13c-7421-4671-8261-0c735cb51f38-bookend-twinkle.mp3",
  "https://www.k-kut.com/ii-delivery/romance/your-heart-poundin-1f016b4a-f85d-4945-b881-2e0f571e6a49-bookend-twinkle.mp3",
  "https://www.k-kut.com/ii-delivery/romance/dont-call-it-love-6e959ac6-9546-4bae-87b2-ed6584185682-bookend-twinkle.mp3",
];

const EXPECTED_STRIPE = [
  "https://buy.stripe.com/28EfZg6gme6S8hS1l44ow0r",
  "https://buy.stripe.com/5kQ8wO206bYKcy88Nw4ow0k",
];

const REQUIRED_TEXT = [
  "K-KUT Romance",
  "K-KUT Romance Levels",
  "G Putnam Music",
  "Romance Matching Schema",
  "Gentle Affection",
  "New Love",
  "Committed Love",
  "Longtime Love",
  "Missing You",
  "Repair / Apology",
  "Desire / Passion",
  "Anniversary",
  "Wedding / Vow-Level",
  "Private Intimate",
  "Sweet Love",
  "Physical Spark",
  "Repair / Still Love You",
  "A Love Like That",
  "Your Heart Poundin",
  "Don't Call It Love",
];

const FORBIDDEN_TEXT = [
  "Music Maykers",
  "LT-PIX",
  "mini-KUT",
  "raw KK",
  "instrumental",
  "instro",
];

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

function fail(msg) {
  console.error("FAIL:", msg);
  process.exitCode = 1;
}

console.log("BIC ROMANCE PRODUCTION AUDIT");
console.log("PAGE:", PAGE_URL);
console.log("");

const pageRes = await fetch(PAGE_URL, { cache: "no-store" }).catch((err) => {
  fail(`Page fetch error: ${err.message}`);
  return null;
});

if (!pageRes) process.exit(1);

console.log("PAGE STATUS:", pageRes.status, pageRes.headers.get("content-type") || "");

if (pageRes.status !== 200) {
  fail(`Page is not 200: ${pageRes.status}`);
  process.exit(1);
}

const html = await pageRes.text();

console.log("");
console.log("---- REQUIRED TEXT ----");
for (const txt of REQUIRED_TEXT) {
  if (html.includes(txt)) {
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
console.log("---- PAGE HREFS ----");
for (const href of hrefs) console.log(href);

console.log("");
console.log("---- PAGE SRCS ----");
for (const src of srcs) console.log(src);

console.log("");
console.log("---- EXPECTED AUDIO URLS ----");
for (const url of EXPECTED_AUDIO) {
  const res = await headOrGet(url);

  if (!res) {
    fail(`Audio request failed: ${url}`);
    continue;
  }

  const contentType = res.headers.get("content-type") || "";
  const contentLength = res.headers.get("content-length") || "";

  console.log(res.status, contentType, contentLength, url);

  if (res.status !== 200) fail(`Audio not 200: ${url}`);
  if (!contentType.includes("audio")) fail(`Audio content-type not audio: ${url} => ${contentType}`);
}

console.log("");
console.log("---- EXPECTED STRIPE URLS ----");
for (const url of EXPECTED_STRIPE) {
  const res = await headOrGet(url);

  if (!res) {
    fail(`Stripe request failed: ${url}`);
    continue;
  }

  const location = res.headers.get("location") || "";
  const contentType = res.headers.get("content-type") || "";

  console.log(res.status, contentType, location, url);

  if (![200, 301, 302, 303, 307, 308].includes(res.status)) {
    fail(`Stripe unexpected status: ${res.status} ${url}`);
  }
}

console.log("");
console.log("---- PAGE-LINK CHECK ----");
for (const href of hrefs) {
  if (href.startsWith("#")) continue;
  if (href.startsWith("mailto:")) continue;
  if (href.startsWith("tel:")) continue;

  const url = href.startsWith("http")
    ? href
    : new URL(href, PAGE_URL).toString();

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
for (const src of srcs.filter((s) => s.includes("/ii-delivery/"))) {
  const url = src.startsWith("http") ? src : new URL(src, PAGE_URL).toString();
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
if (process.exitCode) {
  console.error("BIC ROMANCE PRODUCTION AUDIT: FAIL");
  process.exit(1);
}

console.log("BIC ROMANCE PRODUCTION AUDIT: PASS");
