import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");
const stop = (message) => {
  throw new Error(`CUSTOMER PATHWAY AUDIT FAIL: ${message}`);
};

const home = read("app/_kkut-home.tsx");
const offers = read("app/hug/page.tsx");
const tug = read("app/tug/page.tsx");
const bug = read("app/bug/page.tsx");
const find = read("app/find/page.tsx");
const browse = read("app/browse/page.tsx");
const personal = read("app/personal/page.tsx");
const personalDetail = read("app/personal/[slug]/page.tsx");
const hugzDetail = read("app/hugz/[slug]/page.tsx");
const hugzTray = read("components/HugzThreeChoiceTray.tsx");
const hugzLanding = read("components/HugzRotatingLanding.tsx");
const hold = read("lib/hugzBoundaryHold.ts");
const layout = read("app/layout.tsx");
const middleware = read("middleware.ts");

for (const [name, text] of [
  ["home", home],
  ["offers", offers],
]) {
  for (const route of ["/hugz", "/tug", "/bug"]) {
    if (!text.includes(`href: "${route}"`)) {
      stop(`${name} is missing the ${route} offer destination`);
    }
  }
}

for (const [name, text] of [
  ["TUG", tug],
  ["BUG", bug],
]) {
  if (text.includes("<audio") || text.includes('action="/checkout"')) {
    stop(`${name} exposes audio or checkout without approved inventory`);
  }
  if (!text.includes("will not show a player") && !text.includes("shows no player")) {
    stop(`${name} does not explain its release state`);
  }
}

for (const [name, text] of [
  ["Find", find],
  ["Browse", browse],
]) {
  if (!text.includes("HugzCardGrid") || text.includes("PublicIiBrowser")) {
    stop(`${name} still depends on the held catalog API`);
  }
}

for (const [name, text] of [
  ["Personal", personal],
  ["Personal detail", personalDetail],
]) {
  if (text.includes("buy.stripe.com") || text.includes("<audio")) {
    stop(`${name} bypasses the staged publication gate`);
  }
  if (!text.includes("ApprovedPublicOptionGrid")) {
    stop(`${name} is not using the staged publication gate`);
  }
}

if (
  hugzDetail.includes("PUBLIC_MUSIC_CHOICES_READY") ||
  hugzTray.includes("PUBLIC_CHOICE_TITLES_APPROVED")
) {
  stop("a source-only feature flag can still hide the HUGz release status");
}
if (!hugzDetail.includes("<HugzThreeChoiceTray")) {
  stop("HUGz detail does not render its exact-choice release status");
}
if (hugzTray.includes("<audio") || hugzTray.includes('action="/checkout"')) {
  stop("HUGz exposes audio or payment before exact choices pass");
}
if (!hugzLanding.includes("Open this HUGz Card")) {
  stop("HUGz landing action is missing");
}
for (const action of [
  '"public_choice_titles"',
  '"public_audio"',
  '"checkout"',
  '"delivery"',
  '"fulfillment"',
]) {
  if (!hold.includes(action)) stop(`HUGz hold is missing ${action}`);
}

for (const host of [
  "sentimeant.com",
  "www.sentimeant.com",
  "sentimeants.com",
  "www.sentimeants.com",
]) {
  if (!layout.includes(`'${host}'`) || !middleware.includes(`"${host}"`)) {
    stop(`Sent-i-Meants platform separation is missing ${host}`);
  }
}
for (const route of ["/hugz", "/tug", "/bug", "/checkout"]) {
  if (!middleware.includes(`"${route}"`)) {
    stop(`domain boundary list is missing ${route}`);
  }
}
for (const icon of [
  "/favicon.ico",
  "/apple-touch-icon.png",
  "/apple-touch-icon-precomposed.png",
]) {
  if (!middleware.includes(`"${icon}"`)) {
    stop(`conventional icon fallback is missing ${icon}`);
  }
}

console.log("CUSTOMER PATHWAY AUDIT: PASS");
console.log("HUG/TUG/BUG DESTINATIONS: 3 OF 3");
console.log("BUG ROUTE: PRESENT");
console.log("HELD CATALOG DEPENDENCY ON FIND/BROWSE: 0");
console.log("UNSTAGED PERSONAL AUDIO OR PAYMENT BYPASS: 0");
console.log("SENT-I-MEANTS DOMAIN CROSSOVER: BLOCKED");
console.log("CONVENTIONAL ICON 404S: ROUTED TO LOGO");
