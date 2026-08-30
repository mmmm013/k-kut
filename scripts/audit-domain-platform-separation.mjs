import fs from "node:fs";

const layout = fs.readFileSync("app/layout.tsx", "utf8");
const middleware = fs.readFileSync("middleware.ts", "utf8");
const landing = fs.readFileSync("components/HugzRotatingLanding.tsx", "utf8");
const catalog = fs.readFileSync("lib/hugzSeedCatalog.ts", "utf8");
const privacy = fs.readFileSync("app/privacy/page.tsx", "utf8");
const terms = fs.readFileSync("app/terms/page.tsx", "utf8");
const publicDomainIdentity = fs.readFileSync("lib/publicDomainIdentity.ts", "utf8");

const stop = (message) => {
  throw new Error(message);
};

for (const host of ["13hugz.com", "www.13hugz.com"]) {
  if (!layout.includes(host) || !middleware.includes(host)) {
    stop(`13HUGz hostname separation is missing: ${host}`);
  }
}

if (!layout.includes("isHugzHost") || !layout.includes("!isStandaloneHost ? <header")) {
  stop("K-KUT navigation is not isolated from 13HUGz");
}

for (const legalLink of ['href="/privacy"', 'href="/terms"', 'mailto:reachus@gputnammusic.com']) {
  if (!layout.includes(legalLink)) {
    stop(`13HUGz minimal footer is missing: ${legalLink}`);
  }
}

if (!middleware.includes('url.pathname = "/hugz"')) {
  stop("13HUGz root does not resolve to the rotating-card landing");
}

const hugzBlocklistMatch = middleware.match(
  /const HUGZ_KKUT_ONLY_PREFIXES = \[([\s\S]*?)\];/
);
if (!hugzBlocklistMatch) {
  stop("13HUGz route blocklist could not be inspected");
}

const hugzBlocklist = hugzBlocklistMatch[1];
for (const route of ["/find", "/personal"]) {
  if (hugzBlocklist.includes(`"${route}"`)) {
    stop(`13HUGz governed pathway remains blocked: ${route}`);
  }
}

for (const prefix of [
  "/holiday",
  "/themes",
  "/kupid",
  "/wedding",
  "/hug",
  "/tug",
  "/bug",
  "/browse",
  "/pix",
  "/mkut",
  "/sentimeant",
]) {
  if (!hugzBlocklist.includes(`"${prefix}"`)) {
    stop(`13HUGz no longer blocks K-KUT-only pathway: ${prefix}`);
  }
}

for (const matcher of ['"/find/:path*"', '"/personal/:path*"']) {
  if (!middleware.includes(matcher)) {
    stop(`13HUGz governed pathway is missing middleware coverage: ${matcher}`);
  }
}

for (const [name, page] of [
  ["privacy", privacy],
  ["terms", terms],
]) {
  if (!page.includes("getPublicDomainIdentity")) {
    stop(`${name} page is missing host-aware legal branding`);
  }
  if (!page.includes("A2P_PROGRAM_NAME")) {
    stop(`${name} page lost its governed K-KUT SMS program identity`);
  }
}

for (const brand of ["K-KUT", "13HUGz", "Sent-i-Meants"]) {
  if (!publicDomainIdentity.includes(`publicName: "${brand}"`)) {
    stop(`Public legal identity is missing: ${brand}`);
  }
}

if (!landing.includes("const ROTATION_MS = 33_000")) {
  stop("13HUGz rotation is not locked to 33 seconds");
}

const cardCount = (catalog.match(/["']slug["']:\s*"/g) || []).length;
if (cardCount !== 13) {
  stop(`13HUGz catalog must contain exactly 13 cards; found ${cardCount}`);
}

console.log("DOMAIN PLATFORM SEPARATION AUDIT: PASS");
console.log("13HUGz: 13 ROTATING HUGz CARDS · GOVERNED FIND/PERSONAL ROUTES · 33 SECONDS");
console.log("LEGAL: HOST-AWARE K-KUT · 13HUGz · SENT-I-MEANTS BRANDING");
console.log("K-KUT-ONLY ROUTES: HOST SEPARATION PRESERVED");
