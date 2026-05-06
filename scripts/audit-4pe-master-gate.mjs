import { spawnSync } from "node:child_process";
import fs from "node:fs";

const checks = [
  ["4PE Level 5 control", "scripts/audit-4pe-level5-control.mjs"],
  ["HUG/TUG classification", "scripts/audit-hug-tug-classification.mjs"],
  ["HUG/TUG pricing", "scripts/audit-hug-tug-pricing.mjs"],
  ["User intent capture rules", "scripts/audit-user-intent-capture-rules.mjs"],
  ["4PE event capture API", "scripts/audit-4pe-event-api.mjs"],
  ["Mother’s Day promo sets", "scripts/audit-mothers-day-promo-sets.mjs"],
  ["KLEIGH final guide assets", "scripts/audit-kleigh-guide-final-assets.mjs"],
  ["KK live inventory deploy gate", "scripts/audit-kk-inventory-live-gate.mjs"]
];

const failures = [];

console.log("\n4PE MASTER GATE");
console.log("===============\n");

for (const [name, script] of checks) {
  if (!fs.existsSync(script)) {
    console.log(`SKIP - ${name}: ${script} not found`);
    continue;
  }

  console.log(`\nRUN - ${name}`);
  console.log("-".repeat(60));

  const result = spawnSync("node", [script], {
    stdio: "inherit",
    shell: false
  });

  if (result.status !== 0) {
    failures.push(name);
  }
}

console.log("\nRUN - Next build");
console.log("-".repeat(60));

const build = spawnSync("npm", ["run", "build"], {
  stdio: "inherit",
  shell: false
});

if (build.status !== 0) {
  failures.push("Next build");
}

console.log("\n4PE MASTER GATE SUMMARY");
console.log("=======================");
console.log(`Fail: ${failures.length}`);

if (failures.length) {
  console.log("\nFAILURES");
  console.log("========");
  failures.forEach((failure) => console.log(`FAIL - ${failure}`));
  process.exit(1);
}

console.log("\nPASS - 4PE master gate complete.");
