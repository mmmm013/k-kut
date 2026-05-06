import fs from "node:fs";

const failures = [];

function check(name, ok) {
  console.log(`${ok ? "PASS" : "FAIL"} - ${name}`);
  if (!ok) failures.push(name);
}

const rules = JSON.parse(fs.readFileSync("data/4pe/rules/hug-tug-classification-rules.json", "utf8"));
const data = JSON.parse(fs.readFileSync("data/holiday-kks/mothers-day-thank-you-kks.json", "utf8"));

console.log("\n4PE HUG/TUG PRICING AUDIT");
console.log("=========================\n");

check("Rules define TUG add-on", rules.pricing_rules?.tug_emotional_depth_add_on_usd === 0.33);
check("Rules define checkout label", rules.pricing_rules?.checkout_line_item_label === "TUG emotional-depth matching");
check("Metadata defines pricing model", data.pricing_model?.tug_add_on_usd === 0.33);

check(
  "All assets have price adjustment",
  data.assets.every((a) => typeof a.price_adjustment_usd === "number")
);

check(
  "HUG assets have no add-on",
  data.assets
    .filter((a) => String(a.sentiment_product_type).startsWith("HUG") || a.sentiment_product_type === "HUG")
    .every((a) => a.price_adjustment_usd === 0)
);

check(
  "TUG-primary assets have +0.33 if present",
  data.assets
    .filter((a) => String(a.sentiment_product_type).startsWith("TUG"))
    .every((a) => a.price_adjustment_usd === 0.33)
);

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
