import fs from "node:fs";

const required = [
  "docs/operations/APPLE_LIKE_CONTROL_DOCTRINE.md",
  "docs/ux/STANDARD_HUG_USER_PATHS.md",
  "docs/4pe-package/4PE_PACKAGE_PROCESS.md",
  "docs/4pe-package/4PE_INSTALL_CHECKLIST.md",
  "docs/4pe-package/4PE_OPERATOR_RULES.md",
  "docs/patent/PATENT_FOCUS_NEXT_SESSION.md",
  "docs/founder-quotes/2026-05-05-imagination-production-control.md",
];

const failures = [];

function check(name, ok) {
  console.log(`${ok ? "PASS" : "FAIL"} - ${name}`);
  if (!ok) failures.push(name);
}

console.log("\n4PE PACKAGE DOCUMENTATION AUDIT");
console.log("===============================\n");

for (const file of required) {
  check(`${file} exists`, fs.existsSync(file));
}

const doctrine = fs.readFileSync("docs/operations/APPLE_LIKE_CONTROL_DOCTRINE.md", "utf8");
const paths = fs.readFileSync("docs/ux/STANDARD_HUG_USER_PATHS.md", "utf8");
const pkg = fs.readFileSync("docs/4pe-package/4PE_PACKAGE_PROCESS.md", "utf8");
const patent = fs.readFileSync("docs/patent/PATENT_FOCUS_NEXT_SESSION.md", "utf8");
const quote = fs.readFileSync("docs/founder-quotes/2026-05-05-imagination-production-control.md", "utf8");

check("Doctrine includes Apple-like control", doctrine.includes("We control"));
check("Paths include broad-to-narrow process", paths.includes("broad purpose") && paths.includes("narrower emotional lane"));
check("Paths include alternate user paths", paths.includes("Confused User") && paths.includes("Another Set") && paths.includes("Go Back"));
check("Package process includes install/sell steps", pkg.includes("Define Product Use Case") && pkg.includes("Define Install / Sell Package"));
check("Patent focus includes 4PE, KKr, K-KUT, HUG", patent.includes("4PE") && patent.includes("KKr") && patent.includes("K-KUT") && patent.includes("HUG"));
check("Founder quote includes imagination and production", quote.includes("imagination meets production") && quote.includes("production meets imagination"));

console.log("\nSUMMARY");
console.log("=======");
console.log(`Fail: ${failures.length}`);

if (failures.length) process.exit(1);
