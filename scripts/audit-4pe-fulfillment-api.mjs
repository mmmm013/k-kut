import fs from "node:fs";

const failures = [];

function check(name, ok) {
  console.log(`${ok ? "PASS" : "FAIL"} - ${name}`);
  if (!ok) failures.push(name);
}

const routePath = "app/api/4pe/fulfillment/route.ts";
const route = fs.readFileSync(routePath, "utf8");

console.log("\n4PE HUG FULFILLMENT API AUDIT");
console.log("=============================\n");

check("Fulfillment route exists", fs.existsSync(routePath));
check("Route requires selected HUG id", route.includes("missing_selected_hug_id"));
check("Route requires selected public option id", route.includes("missing_selected_public_option_id"));
check("Route joins public option to exact II", route.includes("currentOption.kk_id_or_delivery_object_id !== selectedHugId"));
check("Route captures selected_hug_title", route.includes("selected_hug_title"));
check("Route captures delivery preference", route.includes("delivery_preference"));
check("Route captures customer_email", route.includes("customer_email"));
check("Route captures checkout_session_id", route.includes("checkout_session_id"));
check("Route writes local fulfillment inbox", route.includes('inbox", "4pe-fulfillment"'));
check("Route disables downloads", route.includes("download_allowed: false"));
check("Route disables SMS", route.includes("sms_enabled: false"));
check("Route uses private HUG link mode", route.includes('share_mode: "private_hug_link"'));
check("Route does not send SMS", !route.includes("twilio.messages.create") && !route.includes("client.messages.create"));
check("Route does not expose raw audio", !route.includes("audio_url") && !route.includes("mp3_url"));
check("Route has no UI import", !route.includes("react") && !route.includes("useState"));

console.log("\nSUMMARY");
console.log("=======");
console.log(`Fail: ${failures.length}`);

if (failures.length) {
  console.log("\nFAILURES");
  console.log("========");
  failures.forEach((failure) => console.log(`FAIL - ${failure}`));
  process.exit(1);
}
