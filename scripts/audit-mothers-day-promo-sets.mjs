import fs from "node:fs";

const failures = [];

function check(name, ok) {
  console.log(`${ok ? "PASS" : "FAIL"} - ${name}`);
  if (!ok) failures.push(name);
}

const metadata = JSON.parse(fs.readFileSync("data/holiday-kks/mothers-day-thank-you-kks.json", "utf8"));
const promo = JSON.parse(fs.readFileSync("data/holiday-kks/mothers-day-promo-sets.json", "utf8"));

const assetIds = new Set(metadata.assets.map((asset) => asset.id));
const selectedIds = promo.sets.flatMap((set) => set.default_asset_ids);

console.log("\nMOTHER'S DAY PROMO SET AUDIT");
console.log("============================\n");

check("Promo set file has 4 curated sets", promo.sets.length === 4);
check("Promo set file preserves one-set display rule", promo.display_rule === "one_section_or_curated_set_at_a_time");
check("Promo set file blocks all-KK dump", promo.ui_rule.includes("Do not display all available KKs"));
check("Promo set file names MC-BOT lead rule", promo.voice_rule.includes("MC-BOT leads"));
check("Promo set file disables downloads", promo.product_control.download_allowed === false);
check("Promo set file disables SMS", promo.product_control.sms_enabled === false);
check("Source metadata has 38 assets", metadata.assets.length === 38);
check("Every promo asset exists in 38-asset metadata", selectedIds.every((id) => assetIds.has(id)));
check("Each set has at least 5 options", promo.sets.every((set) => set.default_asset_ids.length >= 5));
check("Each set has MC-BOT intent", promo.sets.every((set) => Boolean(set.mc_bot_intent)));
check("No raw download language", !JSON.stringify(promo).toLowerCase().includes("download your"));

console.log("\nSUMMARY");
console.log("=======");
console.log(`Fail: ${failures.length}`);

if (failures.length) {
  console.log("\nFAILURES");
  console.log("========");
  failures.forEach((failure) => console.log(`FAIL - ${failure}`));
  process.exit(1);
}
