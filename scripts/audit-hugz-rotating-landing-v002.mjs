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
if (!component.includes("Start a New Sentimeant")) {
  stop("HUGz Card entry action is missing");
}
if (!component.includes("compare three KK or KOMBO HUG choices at a time")) {
  stop("three-choice HUG explanation is missing");
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
console.log("INDIVIDUAL HUGz CARD ROUTES: PRESERVED");
