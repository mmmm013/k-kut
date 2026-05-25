import process from "node:process";

const BASE = (process.env.BIC_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const TIMEOUT_MS = Number(process.env.BIC_TIMEOUT_MS || 30000);

const REQUIRED_PAGES = [
  { name: "home", path: "/", must: ["K-KUT"] },
  { name: "hug", path: "/hug", must: ["K-KUT"] },
  { name: "find", path: "/find", must: ["K-KUT"] },
  { name: "personal index", path: "/personal", must: ["Birthday", "Anniversary", "Wedding"] },
  {
    name: "wedding",
    path: "/personal/wedding",
    must: [
      "MC-BOT Wedding Path",
      "Full song first",
      "Wedding KK Menu",
      "RECOMMENDED: V2 + Ch2",
      "RECOMMENDED NEXT: V2-End",
      "SOLO: Intro",
      "KOMBO: V2-End",
    ],
  },
  { name: "birthday", path: "/personal/birthday", must: ["Birthday"] },
  { name: "anniversary", path: "/personal/anniversary", must: ["Anniversary"] },
  { name: "apology", path: "/personal/apology", must: ["Apology"] },
  { name: "thank-you", path: "/personal/thank-you", must: ["thank"] },
];

const CHECKOUT_PATHS = [
  { name: "birthday checkout", path: "/checkout?product=birthday&source=source-backed-best-birthday-short", expectRedirect: true },
  { name: "anniversary checkout", path: "/checkout?product=anniversary&source=source-backed-awesome-anniversary", expectRedirect: true },
  { name: "generic personal checkout", path: "/checkout?product=personal&source=test", expectRedirect: true },
  { name: "wedding direct checkout guard", path: "/checkout?product=wedding&kk=recommended-v2-plus-ch2-best-kk-kombo", expectRedirect: true },
];

const WEDDING_REQUIRED_KK_LINKS = [
  "recommended-v2-plus-ch2-best-kk-kombo",
  "recommended-next-v2-end",
  "solo-intro",
  "solo-verse-1",
  "solo-chorus-1",
  "solo-verse-2",
  "solo-chorus-2",
  "solo-bridge",
  "solo-final-chorus",
  "solo-outro",
  "kombo-intro-plus-verse-1",
  "kombo-verse-1-plus-chorus-1",
  "kombo-verse-2-plus-chorus-2",
  "kombo-verse-2-plus-chorus-2-plus-bridge",
  "kombo-bridge-plus-final-chorus",
  "kombo-final-chorus-plus-outro",
  "kombo-v2-end",
];

const failures = [];
const warnings = [];

function pass(name, detail = "") {
  console.log(`PASS - ${name}${detail ? ` :: ${detail}` : ""}`);
}

function warn(name, detail = "") {
  warnings.push({ name, detail });
  console.log(`WARN - ${name}${detail ? ` :: ${detail}` : ""}`);
}

function fail(name, detail = "") {
  failures.push({ name, detail });
  console.log(`FAIL - ${name}${detail ? ` :: ${detail}` : ""}`);
}

function absolute(pathOrUrl) {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${BASE}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

async function request(pathOrUrl, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(absolute(pathOrUrl), {
      redirect: options.redirect ?? "manual",
      method: options.method ?? "GET",
      signal: controller.signal,
      headers: { "user-agent": "k-kut-bic-flow-audit" },
    });
    const text = options.readText === false ? "" : await response.text().catch(() => "");
    return { response, text };
  } finally {
    clearTimeout(timeout);
  }
}

function decodeHtmlAttribute(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&#x27;", "'")
    .replaceAll("&#39;", "'")
    .replaceAll("&quot;", "\"")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">");
}

function extractAttributes(html, tag, attr) {
  const values = [];
  const re = new RegExp(`<${tag}\\b[^>]*\\s${attr}=["']([^"']+)["'][^>]*>`, "gi");
  for (const match of html.matchAll(re)) values.push(decodeHtmlAttribute(match[1]));
  return values;
}

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function actionWordsInNonAnchorHtml(html) {
  const cleaned = html.replace(/<a\b[\s\S]*?<\/a>/gi, " ");
  const words = ["Choose this KK", "Use this", "Checkout", "Buy", "Pay", "Continue to checkout", "Select"];
  return words.filter((word) => cleaned.includes(word));
}

async function auditPage(page) {
  const { response, text } = await request(page.path, { redirect: "follow" });
  if (!response.ok) {
    fail(`${page.name} status`, `${response.status} ${response.statusText}`);
    return null;
  }
  pass(`${page.name} status`, String(response.status));

  for (const token of page.must) {
    if (text.includes(token)) pass(`${page.name} contains`, token);
    else fail(`${page.name} missing required text`, token);
  }

  const hrefs = extractAttributes(text, "a", "href");
  const sources = extractAttributes(text, "source", "src");
  const actionLeaks = actionWordsInNonAnchorHtml(text);

  if (actionLeaks.length > 0) {
    warn(`${page.name} has action-looking text outside anchors`, actionLeaks.join(", "));
  } else {
    pass(`${page.name} no dead action text detected`);
  }

  return { text, hrefs, sources, visibleText: stripTags(text) };
}

async function auditLinkTargets(pageName, hrefs) {
  const localLinks = [...new Set(hrefs.filter((href) => href.startsWith("/") && !href.startsWith("/_next/")))];

  for (const href of localLinks) {
    if (href.startsWith("#")) continue;

    try {
      const { response } = await request(href, { redirect: "follow", readText: false });
      if (response.ok || [301, 302, 303, 307, 308].includes(response.status)) {
        pass(`${pageName} link`, `${href} -> ${response.status}`);
      } else {
        fail(`${pageName} broken link`, `${href} -> ${response.status}`);
      }
    } catch (error) {
      fail(`${pageName} link crashed`, `${href} -> ${error?.name || "Error"}: ${error?.message || String(error)}`);
    }
  }
}

async function auditAudioSources(pageName, sources) {
  if (sources.length === 0) {
    warn(`${pageName} audio`, "no source tags found");
    return;
  }

  for (const src of [...new Set(sources)]) {
    const { response } = await request(src, { method: "HEAD", redirect: "manual", readText: false });
    const type = response.headers.get("content-type") || "";
    if ((response.ok || response.status === 206) && /audio|mpeg|mp3|octet-stream/i.test(type)) {
      pass(`${pageName} audio source`, `${src} -> ${response.status} ${type}`);
    } else if (response.ok) {
      warn(`${pageName} audio content-type`, `${src} -> ${response.status} ${type}`);
    } else {
      fail(`${pageName} audio source`, `${src} -> ${response.status} ${type}`);
    }
  }
}

async function auditWeddingMenu(pageData) {
  if (!pageData) return;
  const html = pageData.text;

  for (const kk of WEDDING_REQUIRED_KK_LINKS) {
    const expected = `/personal/wedding?kk=${encodeURIComponent(kk)}#wedding-kk-menu`;
    if (html.includes(expected)) pass("wedding KK selectable link", kk);
    else fail("wedding KK missing selectable link", kk);
  }

  const recommendedFirst = html.indexOf("RECOMMENDED: V2 + Ch2") >= 0;
  const recommendedNext = html.indexOf("RECOMMENDED NEXT: V2-End") >= 0;
  const soloIntro = html.indexOf("SOLO: Intro") >= 0;
  const komboV2End = html.indexOf("KOMBO: V2-End") >= 0;

  if (recommendedFirst && recommendedNext && soloIntro && komboV2End) {
    const orderOk = html.indexOf("RECOMMENDED: V2 + Ch2") < html.indexOf("RECOMMENDED NEXT: V2-End")
      && html.indexOf("RECOMMENDED NEXT: V2-End") < html.indexOf("SOLO: Intro")
      && html.indexOf("SOLO: Intro") < html.indexOf("KOMBO: V2-End");
    if (orderOk) pass("wedding menu order", "recommended, solos, kombos");
    else fail("wedding menu order", "wrong order");
  }

  const selectedPath = "/personal/wedding?kk=recommended-v2-plus-ch2-best-kk-kombo";
  const { response, text } = await request(selectedPath, { redirect: "manual" });
  if (response.ok && text.includes("Selected Wedding KK") && text.includes("recommended-v2-plus-ch2-best-kk-kombo")) {
    pass("wedding KK selection state", selectedPath);
  } else {
    fail("wedding KK selection state", `${selectedPath} -> ${response.status}`);
  }
}

async function auditCheckout() {
  for (const item of CHECKOUT_PATHS) {
    const { response } = await request(item.path, { redirect: "manual", readText: false });
    const location = response.headers.get("location") || "";
    const redirectOk = [301, 302, 303, 307, 308].includes(response.status);

    if (item.expectRedirect && redirectOk) {
      pass(item.name, `${response.status} -> ${location || "redirect"}`);
    } else {
      fail(item.name, `${response.status} ${location}`);
    }
  }
}

async function main() {
  console.log("K-KUT BIC FLOW AUDIT");
  console.log("====================");
  console.log(`Base URL: ${BASE}\n`);

  const pageResults = new Map();
  for (const page of REQUIRED_PAGES) {
    console.log(`\nPAGE: ${page.name}`);
    console.log("-".repeat(40));
    const data = await auditPage(page);
    pageResults.set(page.name, data);
    if (data) {
      await auditLinkTargets(page.name, data.hrefs);
      await auditAudioSources(page.name, data.sources);
    }
  }

  console.log("\nWEDDING KK MENU");
  console.log("-".repeat(40));
  await auditWeddingMenu(pageResults.get("wedding"));

  console.log("\nCHECKOUT / PAYMENT HANDOFFS");
  console.log("-".repeat(40));
  await auditCheckout();

  console.log("\nSUMMARY");
  console.log("=======");
  console.log(`Failures: ${failures.length}`);
  console.log(`Warnings: ${warnings.length}`);

  if (failures.length) {
    console.log("\nFAILURES");
    for (const item of failures) console.log(`- ${item.name}${item.detail ? ` :: ${item.detail}` : ""}`);
    process.exit(1);
  }

  console.log("BIC flow audit passed.");
}

main().catch((error) => {
  fail("audit crashed", error?.stack || error?.message || String(error));
  process.exit(1);
});
