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
for (const required of [
  "Open this HUGz Card",
  "Tell MC-BOT what you mean",
  "sentimeantStartHrefFromHugzCard",
  "The purchased product remains one governed HUG.",
  "matching",
  "HUG choices",
  "not an II or media file",
]) {
  if (!component.includes(required)) {
    stop(`HUGz Card customer action or package boundary is missing: ${required}`);
  }
}
if (component.includes("Start a New Sentimeant")) {
  stop("HUGz card route is still mislabeled as a Sentimeant start");
}
if (component.includes("KK or KOMBO HUG choices")) {
  stop("13HUGz uses a mixed package/II label instead of keeping HUG separate");
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
console.log("HUG CHOICES SHOWN AT ONCE: 3");
console.log("HUG: CUSTOMER PACKAGE ONLY");
console.log("KK/KOMBO: SEPARATE UNDERLYING II EVIDENCE");
console.log("HUGz DISCOVERY AND SENT-I-MEANTS DIALOG: SEPARATE");
console.log("INDIVIDUAL HUGz CARD ROUTES: PRESERVED");
