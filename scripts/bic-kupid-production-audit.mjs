const PAGE_URL = "https://www.k-kut.com/kupid";

const REQUIRED_TEXT = [
  "K-UPID HUGs",
  "G Putnam Music",
  "K-UPID Matching",
  "Desire / Passion",
  "Physical Spark",
  "Private Intimate",
  "Your Heart Poundin",
  "Send this K-UPID HUG",
];


const CONTAINED_AUDIO = [
  "https://www.k-kut.com/ii-delivery/romance/your-heart-poundin-1f016b4a-f85d-4945-b881-2e0f571e6a49-bookend-twinkle.mp3",
];

const EXPECTED_STRIPE = [
  "https://buy.stripe.com/5kQ8wO206bYKcy88Nw4ow0k",
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

console.log("BIC KUPID PRODUCTION AUDIT");
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
  if (html.toLowerCase().includes(txt.toLowerCase())) {
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
console.log("---- CONTAINED STATIC AUDIO URLS ----");
for (const url of CONTAINED_AUDIO) {
  const res = await headOrGet(url);
  if (!res) {
    fail(`Expected audio failed: ${url}`);
    continue;
  }
  const contentType = res.headers.get("content-type") || "";
  console.log(res.status, contentType, url);
  if (res.status !== 404) fail(`Contained static audio is still reachable: ${url}`);
}

console.log("");
console.log("---- EXPECTED STRIPE URLS ----");
for (const url of EXPECTED_STRIPE) {
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
  if (href.startsWith("#")) continue;
  if (href.startsWith("mailto:")) continue;
  if (href.startsWith("tel:")) continue;

  const url = href.startsWith("http") ? href : new URL(href, PAGE_URL).toString();
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
for (const src of srcs.filter((s) => s.includes(".mp3") || s.includes(".wav") || s.includes(".m4a") || s.includes("/ii-delivery/"))) {
  fail(`Page still renders a static audio source: ${src}`);
}

console.log("");
if (process.exitCode) {
  console.error("BIC KUPID PRODUCTION AUDIT: FAIL");
  process.exit(1);
}

console.log("BIC KUPID PRODUCTION AUDIT: PASS");
