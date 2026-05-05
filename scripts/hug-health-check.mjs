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

const requiredGpBotPromptFiles = [
  "public/voices/gp-bot/prompts/welcome.m4a",
  "public/voices/gp-bot/prompts/pick-kind.m4a",
  "public/voices/gp-bot/prompts/pick-one.m4a",
  "public/voices/gp-bot/prompts/pick-song.m4a",
  "public/voices/gp-bot/prompts/live.m4a",
  "public/voices/gp-bot/prompts/coming-soon.m4a",
  "public/voices/gp-bot/prompts/try-mothers-day.m4a",
  "public/voices/gp-bot/prompts/start-hug.m4a",
  "public/voices/gp-bot/prompts/play-demo.m4a",
  "public/voices/gp-bot/prompts/choose-hug.m4a",
  "public/voices/gp-bot/prompts/checkout.m4a",
];

const requiredDemoFiles = [
  "public/mothers-day/thank-you/kkr-study/kk-approved-candidates/thank-you-kk-opening.mp3",
  "public/mothers-day/thank-you/kkr-study/kk-approved-candidates/thank-you-kk-chorus.mp3",
  "public/mothers-day/thank-you/kkr-study/kk-approved-candidates/thank-you-kk-outro.mp3",
];

check("Home page file exists", exists("app/page.tsx"));
check("Mother's Day wizard file exists", exists("app/hug/mothers-day/page.tsx"));

check("GP-BOT welcome prompt exists", exists("public/voices/gp-bot/prompts/welcome.m4a"));

for (const file of requiredGpBotPromptFiles) {
  check(`GP-BOT prompt exists: ${file}`, exists(file));
}

for (const file of requiredDemoFiles) {
  check(`Demo audio exists: ${file}`, exists(file));
}

check("Home has playBotVoice function", home.includes("function playBotVoice"));
check("Home shows Play GP-BOT button", home.includes("Play GP-BOT"));
check("Home uses GP-BOT prompt path", home.includes("/voices/${ACTIVE_BOT}/prompts/") || home.includes("/voices/gp-bot/prompts/"));
check("Home links to Mother's Day wizard", home.includes("/hug/mothers-day"));
check("Home has current action panel", home.includes("Current action"));
check("Home has coming soon response", home.includes("coming soon"));
check("Home has buy-today response", home.includes("buy today"));
check("Home avoids dead Hear BB-BOT wording", !home.includes("Hear BB-BOT"));
check("Home avoids decorative BOT badge", !home.includes("BB-BOT guide · GP-BOT voice"));
check("Home avoids auto-help timers", !home.includes("5000") && !home.includes("12000") && !home.includes("useEffect"));
check("Home routes confusion to demo link", home.includes("I don’t understand — show me the demo") && home.includes('href="/hug/mothers-day"'));
check("Home avoids message path wording", !home.includes("message path"));
check("Home avoids visible Step-number wording", !home.includes("Step {item.step}:") && !home.includes("Active Step 1"));
check("Home intro says read below", home.includes("Please read below first"));
check("Home uses music bullets", home.includes("♪") && home.includes("♬") && home.includes("♫"));

check("Mother's Day has playBotVoice function", mothers.includes("function playBotVoice"));
check("Mother's Day shows Play GP-BOT button", mothers.includes("Play GP-BOT"));
check("Mother's Day uses GP-BOT prompt path", mothers.includes("/voices/gp-bot/prompts/"));
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
