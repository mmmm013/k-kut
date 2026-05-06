import fs from "node:fs";

const failures = [];

function check(name, ok) {
  console.log(`${ok ? "PASS" : "FAIL"} - ${name}`);
  if (!ok) failures.push(name);
}

const data = JSON.parse(fs.readFileSync("data/holiday-kks/mothers-day-thank-you-kks.json", "utf8"));

console.log("\n4PE HUG/TUG CLASSIFICATION AUDIT");
console.log("================================\n");

check("Metadata has assets", Array.isArray(data.assets) && data.assets.length > 0);
check("Metadata has 38 assets", data.assets.length === 38);
check("All assets have price adjustment", data.assets.every((a) => typeof a.price_adjustment_usd === "number"));
check("All assets disallow downloads", data.assets.every((a) => a.download_allowed === false));
check("All assets use private HUG link share mode", data.assets.every((a) => a.share_mode === "private_hug_link"));
check("No UI wiring is implied", data.display_rule === "one_section_or_curated_set_at_a_time");

console.log("\nSUMMARY");
console.log("=======");
console.log(`Fail: ${failures.length}`);

if (failures.length) {
  console.log("\nFAILURES");
  console.log("========");
  failures.forEach((failure) => console.log(`FAIL - ${failure}`));
  process.exit(1);
}
