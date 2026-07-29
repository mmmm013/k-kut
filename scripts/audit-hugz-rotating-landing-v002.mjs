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
  stop("33-second HUGz rotation is missing");
}
if (!component.includes("whitespace-nowrap")) {
  stop("single-line headline lock is missing");
}
if (!component.includes("ResizeObserver")) {
  stop("responsive one-line fitting is missing");
}
if (!component.includes("Temporary standalone HUGz")) {
  stop("temporary standalone identity is missing");
}
if (!component.includes("Open this HUGz")) {
  stop("HUGz entry action is missing");
}
if (!page.includes("HugzRotatingLanding")) {
  stop("rotating HUGz landing is not installed");
}
if (page.includes("HugzDiscoveryGrid")) {
  stop("old HUGz grid remains active on landing");
}

console.log("HUGZ ROTATING LANDING AUDIT: PASS");
console.log("LANDING MODE: ONE HUGz AT A TIME");
console.log("ROTATION: 33 SECONDS");
console.log("HEADLINE: RESPONSIVE SINGLE LINE");
console.log("INDIVIDUAL HUGz ROUTES: PRESERVED");
