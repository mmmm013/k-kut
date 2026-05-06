import fs from "node:fs";

const failures = [];

function exists(path) {
  return fs.existsSync(path);
}

function read(path) {
  return exists(path) ? fs.readFileSync(path, "utf8") : "";
}

function check(name, ok) {
  console.log(`${ok ? "PASS" : "FAIL"} - ${name}`);
  if (!ok) failures.push(name);
}

const level5 = read("docs/gpmx-rules/4PE_LEVEL_5_DMAIC_CONTROL.md");
const holidayTemplate = read("docs/gpmx-rules/HOLIDAY_KK_SET_TEMPLATE.md");
const hugTug = read("docs/gpmx-rules/HUGS_AND_TUGS.md");
const userIntent = read("docs/gpmx-rules/USER_INTENT_AND_CRM_CAPTURE.md");
const eventsRoute = read("app/api/4pe/events/route.ts");
const hugTugRules = read("data/4pe/rules/hug-tug-classification-rules.json");
const intentRules = read("data/4pe/rules/user-intent-capture-rules.json");
const mothersData = read("data/holiday-kks/mothers-day-thank-you-kks.json");

console.log("\n4PE LEVEL 5 CONTROL AUDIT");
console.log("=========================\n");

check("Level 5 DMAIC doc exists", exists("docs/gpmx-rules/4PE_LEVEL_5_DMAIC_CONTROL.md"));
check("Level 5 doc states Six Sigma Black Belt DMAIC discipline", level5.includes("Six Sigma Black Belt DMAIC discipline"));
check("Level 5 doc defines DMAIC", level5.includes("Define") && level5.includes("Measure") && level5.includes("Analyze") && level5.includes("Improve") && level5.includes("Control"));

check("Holiday KK Set Template exists", exists("docs/gpmx-rules/HOLIDAY_KK_SET_TEMPLATE.md"));
check("Holiday template preserves one-section display rule", holidayTemplate.includes("one section") || holidayTemplate.includes("one curated set"));
check("Holiday template blocks all-KK dump", holidayTemplate.includes("Do not display all available KKs at once"));

check("HUGs and TUGs language exists", exists("docs/gpmx-rules/HUGS_AND_TUGS.md"));
check("HUG/TUG docs define HUG", hugTug.includes("A HUG carries"));
check("HUG/TUG docs define TUG", hugTug.includes("A TUG carries"));
check("HUG/TUG docs block downloads", hugTug.includes("not downloadable audio files"));

check("User intent capture doc exists", exists("docs/gpmx-rules/USER_INTENT_AND_CRM_CAPTURE.md"));
check("User intent doc locks no UI change", userIntent.includes("does not authorize a UI change"));
check("User intent doc includes SMS consent rules", userIntent.includes("SMS consent"));

check("4PE event capture API exists", exists("app/api/4pe/events/route.ts"));
check("4PE event API is capture only", eventsRoute.includes("Capture only. No UI wiring. No SMS sending."));
check("4PE event API disables SMS", eventsRoute.includes("sms_enabled: false"));
check("4PE event API writes local inbox fallback", eventsRoute.includes('inbox", "4pe-events"'));

check("HUG/TUG classification rules exist", exists("data/4pe/rules/hug-tug-classification-rules.json"));
check("HUG/TUG rules include TUG +0.33 pricing", hugTugRules.includes('"tug_emotional_depth_add_on_usd": 0.33'));

check("User intent capture rules exist", exists("data/4pe/rules/user-intent-capture-rules.json"));
check("User intent rules keep Twilio SMS disabled", intentRules.includes('"twilio_sms_enabled": false'));

check("Mother’s Day Thank You metadata exists", exists("data/holiday-kks/mothers-day-thank-you-kks.json"));
check("Mother’s Day metadata has 38 assets", mothersData.includes('"asset_count": 38') || (mothersData.match(/"id":/g) || []).length === 38);
check("Mother’s Day metadata blocks downloads", mothersData.includes('"download_allowed": false'));
check("Mother’s Day metadata uses private HUG link", mothersData.includes('"share_mode": "private_hug_link"'));

check("Event API audit exists", exists("scripts/audit-4pe-event-api.mjs"));
check("HUG/TUG classification audit exists", exists("scripts/audit-hug-tug-classification.mjs"));
check("HUG/TUG pricing audit exists", exists("scripts/audit-hug-tug-pricing.mjs"));
check("User intent capture audit exists", exists("scripts/audit-user-intent-capture-rules.mjs"));

console.log("\nSUMMARY");
console.log("=======");
console.log(`Fail: ${failures.length}`);

if (failures.length) {
  console.log("\nFAILURES");
  console.log("========");
  failures.forEach((failure) => console.log(`FAIL - ${failure}`));
  process.exit(1);
}
