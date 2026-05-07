import fs from "node:fs";

const failures = [];

function read(path) {
  return fs.existsSync(path) ? fs.readFileSync(path, "utf8") : "";
}

function check(name, ok) {
  console.log(`${ok ? "PASS" : "FAIL"} - ${name}`);
  if (!ok) failures.push(name);
}

const pagePath = "app/hug/mothers-day/page.tsx";
const page = read(pagePath);
const uiLock = read("docs/gpmx-rules/UI_DESIGN_LOCK.md");
const promo = JSON.parse(read("data/holiday-kks/mothers-day-promo-sets.json"));
const metadata = JSON.parse(read("data/holiday-kks/mothers-day-thank-you-kks.json"));

const allText = [
  page,
  uiLock,
  JSON.stringify(promo),
  JSON.stringify(metadata)
].join("\n");

const kkOfferIds = metadata.assets
  .filter((asset) => asset.active_offer_eligible === true)
  .map((asset) => asset.id);

console.log("\nAPPROVED MOTHER'S DAY LANDING FLOW AUDIT");
console.log("========================================\n");

check("Mother's Day HUG page exists", fs.existsSync(pagePath));
check("UI design lock exists", uiLock.includes("approved and locked"));
check("UI changes require owner consent", uiLock.includes("without explicit owner consent"));
check("Mother's Day offer is KK-only", metadata.active_offer_rule?.includes("only approved Thank You KKs"));
check("LineFeels are paused", metadata.linefeels_paused_for_refinement === true);
check("Active offer has 7 KKs", kkOfferIds.length === 7);
check("Active offer excludes LineFeels", kkOfferIds.every((id) => !id.startsWith("thank-you-cc")));
check("Active offer excludes sections", kkOfferIds.every((id) => !id.startsWith("thank-you-sec")));
check("Promo set is KK-only", promo.sets.length === 1 && promo.sets[0].id === "approved-thank-you-kks");
check("Promo set includes all 7 KKs", promo.sets[0].default_asset_ids.length === 7);
check("Promo disables downloads", promo.product_control.download_allowed === false);
check("Promo disables SMS", promo.product_control.sms_enabled === false);
check("Private HUG link mode exists", allText.includes("private_hug_link"));
check("MC-BOT lead rule exists", allText.includes("MC-BOT"));
check("GP-BOT restricted rule exists", allText.includes("GP-BOT"));
check("No all-KK dump rule exists", allText.includes("Do not display all available KKs") || allText.includes("one_section_or_curated_set_at_a_time"));
check("Checkout route exists", fs.existsSync("app/api/4pe/fulfillment/route.ts") || fs.existsSync("app/api/donate/route.ts") || page.includes("checkout") || page.includes("stripe"));
check("No raw download language", !allText.toLowerCase().includes("download your audio"));

console.log("\nSUMMARY");
console.log("=======");
console.log(`Fail: ${failures.length}`);

if (failures.length) {
  console.log("\nFAILURES");
  console.log("========");
  failures.forEach((failure) => console.log(`FAIL - ${failure}`));
  process.exit(1);
}
