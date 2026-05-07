import fs from "node:fs";

const failures = [];

function check(name, ok) {
  console.log(`${ok ? "PASS" : "FAIL"} - ${name}`);
  if (!ok) failures.push(name);
}

const metadata = JSON.parse(fs.readFileSync("data/holiday-kks/mothers-day-thank-you-kks.json", "utf8"));
const promo = JSON.parse(fs.readFileSync("data/holiday-kks/mothers-day-promo-sets.json", "utf8"));

const active = metadata.assets.filter((asset) => asset.active_offer_eligible === true);
const pausedLineFeels = metadata.assets.filter((asset) => asset.asset_family === "feellines_cc");
const promoIds = promo.sets.flatMap((set) => set.default_asset_ids);

console.log("\nMOTHER'S DAY KK-ONLY OFFER AUDIT");
console.log("================================\n");

check("Metadata still has 38 total assets", metadata.assets.length === 38);
check("LineFeels are paused for refinement", metadata.linefeels_paused_for_refinement === true);
check("All LineFeels are inactive", pausedLineFeels.length === 22 && pausedLineFeels.every((asset) => asset.active_offer_eligible === false));
check("Active public offer has 7 assets", active.length === 7);
check("All active assets are Thank You KKs", active.every((asset) => asset.id.startsWith("thank-you-kk")));
check("Promo has one KK-only set", promo.sets.length === 1 && promo.sets[0].id === "approved-thank-you-kks");
check("Promo set includes all 7 KKs", promoIds.length === 7);
check("Promo set excludes LineFeels/CC", promoIds.every((id) => !id.startsWith("thank-you-cc")));
check("Promo set excludes sections", promoIds.every((id) => !id.startsWith("thank-you-sec")));
check("Promo preserves one-set display rule", promo.display_rule === "one_section_or_curated_set_at_a_time");
check("Promo disables downloads", promo.product_control.download_allowed === false);
check("Promo disables SMS", promo.product_control.sms_enabled === false);

console.log("\nSUMMARY");
console.log("=======");
console.log(`Fail: ${failures.length}`);

if (failures.length) {
  console.log("\nFAILURES");
  console.log("========");
  failures.forEach((failure) => console.log(`FAIL - ${failure}`));
  process.exit(1);
}
