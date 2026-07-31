import fs from "node:fs";

const layout = fs.readFileSync("app/layout.tsx", "utf8");
const middleware = fs.readFileSync("middleware.ts", "utf8");
const landing = fs.readFileSync("components/HugzRotatingLanding.tsx", "utf8");
const catalog = fs.readFileSync("lib/hugzSeedCatalog.ts", "utf8");

const stop = (message) => {
  throw new Error(message);
};

for (const host of ["13hugz.com", "www.13hugz.com"]) {
  if (!layout.includes(host) || !middleware.includes(host)) {
    stop(`13HUGz hostname separation is missing: ${host}`);
  }
}

if (!layout.includes("isHugzHost") || !layout.includes("!isHugzHost &&")) {
  stop("all non-13HUGz navigation is not isolated from 13HUGz");
}
if (
  !layout.includes("isSentimeantHost ? <SentimeantHeader /> : <GenericHeader />")
) {
  stop("Sentimeant and general K-KUT headers are not explicitly separated");
}
if (!layout.includes("function SentimeantHeader()")) {
  stop("Sentimeant-specific GPMx header is missing");
}
if (!layout.includes("function GenericHeader()")) {
  stop("general K-KUT navigation header is missing");
}

for (const legalLink of ['href="/privacy"', 'href="/terms"', 'mailto:reachus@gputnammusic.com']) {
  if (!layout.includes(legalLink)) {
    stop(`13HUGz minimal footer is missing: ${legalLink}`);
  }
}

if (!middleware.includes('url.pathname = "/hugz"')) {
  stop("13HUGz root does not resolve to the rotating-card landing");
}

for (const prefix of ["/find", "/personal", "/holiday", "/themes", "/kupid", "/wedding"]) {
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
console.log("13HUGz: 13 ROTATING HUGz CARDS · 33 SECONDS · MINIMAL LEGAL FOOTER");
console.log("SENTIMEANT: GPMx + SENT-I-MEANTS-ONLY HEADER");
console.log("K-KUT: FULL NAVIGATION PRESERVED ON GENERAL K-KUT HOSTS ONLY");
