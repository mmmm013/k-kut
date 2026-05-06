import fs from "node:fs";

const failures = [];

function check(name, ok) {
  console.log(`${ok ? "PASS" : "FAIL"} - ${name}`);
  if (!ok) failures.push(name);
}

const pagePath = "app/hug/mothers-day/page.tsx";
const page = fs.readFileSync(pagePath, "utf8");

console.log("\nMOTHER'S DAY CHECKOUT HANDOFF AUDIT");
console.log("===================================\n");

check("Checkout handoff function exists", page.includes("async function startCheckout()"));
check("Checkout handoff posts to fulfillment API", page.includes('fetch("/api/4pe/fulfillment"'));
check("Checkout handoff sends selected HUG id", page.includes("selected_hug_id: selectedDemo.id"));
check("Checkout handoff sends selected HUG title", page.includes("selected_hug_title: selectedDemo.title"));
check("Checkout handoff marks HUG product family", page.includes('product_family: "HUG"'));
check("Checkout handoff keeps SMS disabled", page.includes("consent_sms: false") && page.includes("sms_enabled: false"));
check("Checkout handoff keeps no-download metadata", page.includes("no_download: true"));
check("Checkout still opens Stripe after capture", page.includes("window.location.href = STRIPE_URL"));
check("Checkout is a button, not blind Stripe anchor", page.includes("onClick={startCheckout}"));
check("No raw audio is sent in checkout handoff", !page.includes("audio_url: selectedDemo") && !page.includes("mp3_url: selectedDemo"));

console.log("\nSUMMARY");
console.log("=======");
console.log(`Fail: ${failures.length}`);

if (failures.length) {
  console.log("\nFAILURES");
  console.log("========");
  failures.forEach((failure) => console.log(`FAIL - ${failure}`));
  process.exit(1);
}
