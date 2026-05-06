import fs from "node:fs";

const failures = [];

function check(name, ok) {
  console.log(`${ok ? "PASS" : "FAIL"} - ${name}`);
  if (!ok) failures.push(name);
}

const routePath = "app/api/4pe/events/route.ts";
const route = fs.readFileSync(routePath, "utf8");

console.log("\n4PE EVENT CAPTURE API AUDIT");
console.log("===========================\n");

check("Route exists", fs.existsSync(routePath));
check("Route is capture only", route.includes("Capture only. No UI wiring. No SMS sending."));
check("Route does not send SMS", !route.includes("twilio.messages.create") && !route.includes("client.messages.create"));
check("Route has SMS disabled response", route.includes("sms_enabled: false"));
check("Route validates event types", route.includes("ALLOWED_EVENT_TYPES"));
check("Route captures feeling_entered", route.includes('"feeling_entered"'));
check("Route captures option_selected", route.includes('"option_selected"'));
check("Route captures checkout_clicked", route.includes('"checkout_clicked"'));
check("Route captures delivery preference", route.includes("delivery_preference"));
check("Route captures consent_sms", route.includes("consent_sms"));
check("Route writes local inbox fallback", route.includes('inbox", "4pe-events"'));
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
