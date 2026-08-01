import fs from "node:fs";

const layout = fs.readFileSync("app/layout.tsx", "utf8");
const middleware = fs.readFileSync("middleware.ts", "utf8");
const landing = fs.readFileSync("components/HugzRotatingLanding.tsx", "utf8");
const catalog = fs.readFileSync("lib/hugzSeedCatalog.ts", "utf8");
const platformLaw = fs.readFileSync("lib/crossDomainHugDp.ts", "utf8");

const stop = (message) => {
  throw new Error(message);
};

for (const host of ["13hugz.com", "www.13hugz.com"]) {
  if (!platformLaw.includes(host) || !middleware.includes(host)) {
    stop(`13HUGz hostname separation is missing: ${host}`);
  }
}

for (const host of [
  "sentimeant.com",
  "www.sentimeant.com",
  "sentimeants.com",
  "www.sentimeants.com",
  "gputnammusic.com",
  "www.gputnammusic.com",
  "k-kut.com",
  "www.k-kut.com",
]) {
  if (!platformLaw.includes(host)) {
    stop(`shared platform authority is missing host: ${host}`);
  }
}

if (!layout.includes("platformForHost")) {
  stop("layout is not using shared platform-role authority");
}
if (!layout.includes("isHugzHost") || !layout.includes("!isHugzHost &&")) {
  stop("all non-13HUGz navigation is not isolated from 13HUGz");
}
for (const header of [
  "function GpmxHeader()",
  "function SentimeantHeader()",
  "function KkutHeader()",
]) {
  if (!layout.includes(header)) {
    stop(`platform-specific header is missing: ${header}`);
  }
}
if (
  !layout.includes('platform.id === "13hugz"') ||
  !layout.includes('platform.id === "sentimeants"') ||
  !layout.includes('platform.id === "gpmx"')
) {
  stop("GPMx, Sent-i-Meants, 13HUGz, and K-KUT presentation is not explicitly separated");
}

for (const legalLink of [
  'href="/privacy"',
  'href="/terms"',
  'mailto:reachus@gputnammusic.com',
]) {
  if (!layout.includes(legalLink)) {
    stop(`13HUGz minimal footer is missing: ${legalLink}`);
  }
}

if (!middleware.includes('url.pathname = "/hugz"')) {
  stop("13HUGz root does not resolve to the rotating-card landing");
}

for (const prefix of [
  "/find",
  "/personal",
  "/holiday",
  "/themes",
  "/kupid",
  "/wedding",
]) {
  if (!middleware.includes(`"${prefix}"`)) {
    stop(`13HUGz does not block K-KUT-only pathway: ${prefix}`);
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
console.log("GPMx: MUSIC AUTHORITY & DISCOVERY");
console.log("SENT-I-MEANTS: MEANING, REFLECTION & MATCHING");
console.log("13HUGz: 13 VISUAL HUGz CARDS · 33 SECONDS · MINIMAL FOOTER");
console.log("K-KUT: EXACT-II CHECKOUT, DELIVERY & SUPPORT");
console.log("CANONICAL CUSTOMER PRODUCT ACROSS ALL PLATFORMS: HUG");
