import fs from "node:fs";

const failures = [];

function check(name, ok) {
  console.log(`${ok ? "PASS" : "FAIL"} - ${name}`);
  if (!ok) failures.push(name);
}

const doc = fs.readFileSync("docs/gpmx-rules/USER_INTENT_AND_CRM_CAPTURE.md", "utf8");
const rules = JSON.parse(fs.readFileSync("data/4pe/rules/user-intent-capture-rules.json", "utf8"));

console.log("\nGPMx USER INTENT CAPTURE AUDIT");
console.log("==============================\n");

check("Doc exists and names CRM capture", doc.includes("CRM Capture"));
check("Doc locks no UI change", doc.includes("does not authorize a UI change"));
check("Rules define event types", Array.isArray(rules.event_types) && rules.event_types.length >= 10);
check("Rules include feeling_entered", rules.event_types.includes("feeling_entered"));
check("Rules include option_selected", rules.event_types.includes("option_selected"));
check("Rules include checkout_clicked", rules.event_types.includes("checkout_clicked"));
check("Rules include delivery preferences", rules.delivery_preferences.includes("email") && rules.delivery_preferences.includes("own_text"));
check("Twilio SMS disabled by rule", rules.sms_rule.twilio_sms_enabled === false);
check("SMS consent voluntary", rules.sms_rule.consent_must_be_voluntary === true);
check("SMS checkbox default unchecked", rules.sms_rule.checkbox_default === "unchecked");
check("HUG downloads disallowed", rules.product_control.hug_download_allowed === false);
check("TUG downloads disallowed", rules.product_control.tug_download_allowed === false);
check("Song downloads only when explicitly sold", rules.product_control.song_downloads_only_when_explicitly_sold === true);
check("Required fields include session_id", rules.required_event_fields.includes("session_id"));
check("Required fields include selected_hug_id", rules.required_event_fields.includes("selected_hug_id"));

console.log("\nSUMMARY");
console.log("=======");
console.log(`Fail: ${failures.length}`);

if (failures.length) {
  console.log("\nFAILURES");
  console.log("========");
  failures.forEach((failure) => console.log(`FAIL - ${failure}`));
  process.exit(1);
}
