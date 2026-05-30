const PAGE_URL = "https://www.k-kut.com/wedding";

const REQUIRED_TEXT = [
  "Wedding",
  "G Putnam Music",
  "Send",
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

console.log("BIC WEDDING PRODUCTION AUDIT");
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
const audioSrcs = srcs.filter((s) =>
  s.includes(".mp3") || s.includes(".wav") || s.includes(".m4a") || s.includes("/ii-delivery/")
);
const stripeHrefs = hrefs.filter((h) => h.includes("buy.stripe.com"));

console.log("");
console.log("---- PAGE HREFS ----");
for (const href of hrefs) console.log(href);

console.log("");
console.log("---- PAGE SRCS ----");
for (const src of srcs) console.log(src);

console.log("");
console.log("---- STRIPE CHECK ----");
if (!stripeHrefs.length) {
  fail("No Stripe checkout links found on /wedding.");
}
for (const href of stripeHrefs) {
  const res = await headOrGet(href);
  if (!res) {
    fail(`Stripe request failed: ${href}`);
    continue;
  }
  const contentType = res.headers.get("content-type") || "";
  console.log(res.status, contentType, href);
  if (![200, 301, 302, 303, 307, 308].includes(res.status)) {
    fail(`Stripe bad status ${res.status}: ${href}`);
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
if (!audioSrcs.length) {
  fail("No customer audio sources found on /wedding. Audio is required before BIC buyer release.");
}
for (const src of audioSrcs) {
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
  console.error("BIC WEDDING PRODUCTION AUDIT: FAIL");
  process.exit(1);
}

console.log("BIC WEDDING PRODUCTION AUDIT: PASS");
