import fs from "node:fs";

const files = [
  "docs/founder-quotes/2026-05-05-imagination-production-4pe.md",
  "docs/strategy/4PE_KKR_HUG_SCENARIO_MAP.md",
  "docs/operations/BIC_LEVEL_OPERATING_RULES.md",
];

const failures = [];

function check(name, ok) {
  console.log(`${ok ? "PASS" : "FAIL"} - ${name}`);
  if (!ok) failures.push(name);
}

console.log("\nBIC OPERATING DOCTRINE AUDIT");
console.log("============================\n");

for (const file of files) {
  check(`${file} exists`, fs.existsSync(file));
}

const quote = fs.readFileSync(files[0], "utf8");
const scenarios = fs.readFileSync(files[1], "utf8");
const rules = fs.readFileSync(files[2], "utf8");

check("Founder quote captures imagination/production doctrine", quote.includes("imagination meets production") && quote.includes("production meets imagination"));
check("Founder quote includes charitable purpose", quote.includes("charitableness"));
check("Scenario map includes guided choice path", scenarios.includes("General → narrower → narrower"));
check("Scenario map includes mobile streaming", scenarios.includes("Mobile Streaming Scenario"));
check("Scenario map includes gifting", scenarios.includes("Gifting Scenario"));
check("Scenario map includes media channels", scenarios.includes("Social / Media Channel Scenario"));
check("Scenario map includes metadata refinement", scenarios.includes("Feeling") && scenarios.includes("Mood") && scenarios.includes("User behavior"));
check("Scenario map keeps Scherer support on hold", scenarios.includes("ON HOLD"));
check("Rules enforce one focus", rules.includes("One step at a time"));
check("Rules enforce fit beats quantity", rules.includes("Fit Beats Quantity"));
check("Rules forbid internal leakage", rules.includes("18A"));
check("Rules enforce buyer path", rules.includes("Buyer Path Must Always Exist"));

console.log("\nSUMMARY");
console.log("=======");
console.log(`Fail: ${failures.length}`);

if (failures.length) process.exit(1);
