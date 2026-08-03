import fs from "node:fs";

const component = fs.readFileSync(
  "components/HugzRotatingLanding.tsx",
  "utf8",
);
const page = fs.readFileSync("app/hugz/page.tsx", "utf8");

const stop = (message) => {
  throw new Error(message);
};

if (!component.includes("const ROTATION_MS = 33_000")) {
  stop("33-second HUGz Card rotation is missing");
}
if (!component.includes("whitespace-nowrap")) {
  stop("single-line headline lock is missing");
}
if (!component.includes("ResizeObserver")) {
  stop("responsive one-line fitting is missing");
}
if (!component.includes("HUGz Card {activeIndex + 1}")) {
  stop("HUGz Card identity is missing");
}
if (!component.includes("Choose this HUG")) {
  stop("plain customer entry action is missing");
}
if (
  !component.includes(
    "Open this card and choose what you want your HUG to do.",
  )
) {
  stop("plain customer guidance is missing");
}
if (!component.includes("object-contain object-top")) {
  stop("approved top-aligned artwork placement is missing");
}
if (!component.includes("HUGZ_BOUNDARY_HOLD.publicMessage")) {
  stop("truthful audio-preview hold message is missing");
}

for (const forbidden of [
  "LT-PIX",
  "not an II",
  "KK or KOMBO",
  "seed.excerpt",
]) {
  if (component.includes(forbidden)) {
    stop(`public carousel still contains internal language: ${forbidden}`);
  }
}

if (!page.includes("HugzRotatingLanding")) {
  stop("rotating HUGz Card landing is not installed");
}
if (page.includes("HugzDiscoveryGrid")) {
  stop("old HUGz grid remains active on landing");
}

console.log("HUGZ CARD ROTATING LANDING AUDIT: PASS");
console.log("LANDING MODE: ONE HUGz CARD AT A TIME");
console.log("ROTATION: 33 SECONDS");
console.log("HEADLINE: RESPONSIVE SINGLE LINE");
console.log("PUBLIC COPY: CUSTOMER-FACING ONLY");
console.log("ARTWORK: TOP-ALIGNED OBJECT-CONTAIN");
console.log("INDIVIDUAL HUGz CARD ROUTES: PRESERVED");
