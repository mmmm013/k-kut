import fs from "fs";

const checks = [];

function check(name, ok, detail = "") {
  checks.push({ name, ok, detail });
}

function exists(path) {
  return fs.existsSync(path);
}

function read(path) {
  return exists(path) ? fs.readFileSync(path, "utf8") : "";
}

const home = read("app/page.tsx");
const mothers = read("app/hug/mothers-day/page.tsx");

const forbiddenPlaceholderVoiceFiles = [
  "public/voices/mc-bot/welcome.m4a",
  "public/voices/mc-bot/pick-kind.m4a",
  "public/voices/mc-bot/pick-one.m4a",
  "public/voices/mc-bot/pick-song.m4a",
  "public/voices/mc-bot/start-hug.m4a",
  "public/voices/mc-bot/play-demo.m4a",
  "public/voices/mc-bot/choose-hug.m4a",
  "public/voices/mc-bot/checkout.m4a",
];

const requiredDemoFiles = [
  "public/mothers-day/thank-you/kkr-study/kk-approved-candidates/thank-you-kk-opening.mp3",
  "public/mothers-day/thank-you/kkr-study/kk-approved-candidates/thank-you-kk-chorus.mp3",
  "public/mothers-day/thank-you/kkr-study/kk-approved-candidates/thank-you-kk-outro.mp3",
];

check("Home page file exists", exists("app/page.tsx"));
check("Mother's Day wizard file exists", exists("app/hug/mothers-day/page.tsx"));

check("Real MC-BOT welcome voice exists", exists("public/voices/mc-bot/welcome.m4a"));

for (const file of requiredDemoFiles) {
  check(`Demo audio exists: ${file}`, exists(file));
}

check("Home has playBotVoice function", home.includes("function playBotVoice"));
check("Home shows Play MC-BOT voice button", home.includes("Play MC-BOT voice"));
check("Home uses real MC-BOT audio path", home.includes("/voices/mc-bot/"));
check("Home links to Mother's Day wizard", home.includes("/hug/mothers-day"));
check("Home has current action panel", home.includes("Current action"));
check("Home has coming soon response", home.includes("coming soon"));
check("Home has buy-today response", home.includes("buy today"));
check("Home avoids dead Hear BB-BOT wording", !home.includes("Hear BB-BOT"));
check("Home avoids message path wording", !home.includes("message path"));

check("Mother's Day has playBotVoice function", mothers.includes("function playBotVoice"));
check("Mother's Day does not show fake Play BB-BOT voice button", !mothers.includes("Play BB-BOT voice"));
check("Mother's Day avoids fake MC-BOT audio path until real clips exist", !mothers.includes("/voices/mc-bot/"));
check("Mother's Day has Play demo button", mothers.includes("Play demo"));
check("Mother's Day has Choose this HUG button", mothers.includes("Choose this HUG"));
check("Mother's Day has checkout price button", mothers.includes("Checkout · $7.99"));
check("Mother's Day has Stripe link", mothers.includes("https://buy.stripe.com/14AeVcawC9QCaq04xg4ow0p"));

const failed = checks.filter((item) => !item.ok);

console.log("\nK-KUT HUG HEALTH CHECK");
console.log("======================\n");

for (const item of checks) {
  console.log(`${item.ok ? "PASS" : "FAIL"} - ${item.name}${item.detail ? ` — ${item.detail}` : ""}`);
}

console.log("\nSUMMARY");
console.log("=======");
console.log(`Total: ${checks.length}`);
console.log(`Pass:  ${checks.length - failed.length}`);
console.log(`Fail:  ${failed.length}`);

if (failed.length) {
  process.exit(1);
}
