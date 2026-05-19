import fs from "node:fs";

const checks = [];

function check(name, ok) {
  checks.push({ name, ok: Boolean(ok) });
}

function exists(path) {
  return fs.existsSync(path);
}

const home = fs.readFileSync("app/page.tsx", "utf8");
const mothers = fs.readFileSync("app/hug/mothers-day/page.tsx", "utf8");

console.log("\nK-KUT HUG HEALTH CHECK");
console.log("======================\n");

check("Home page file exists", exists("app/page.tsx"));
check("Mother's Day wizard file exists", exists("app/hug/mothers-day/page.tsx"));

[
  "welcome",
  "pick-kind",
  "pick-one",
  "pick-song",
  "live",
  "coming-soon",
  "try-mothers-day",
  "start-hug",
  "play-demo",
  "choose-hug",
  "checkout",
].forEach((clip) => {
  check(`GP-BOT prompt exists: public/voices/gp-bot/prompts/${clip}.m4a`, exists(`public/voices/gp-bot/prompts/${clip}.m4a`));
});

[
  "public/mothers-day/thank-you/kkr-study/kk-approved-candidates/thank-you-kk-opening.mp3",
  "public/mothers-day/thank-you/kkr-study/kk-approved-candidates/thank-you-kk-chorus.mp3",
  "public/mothers-day/thank-you/kkr-study/kk-approved-candidates/thank-you-kk-outro.mp3",
].forEach((file) => {
  check(`Demo audio exists: ${file}`, exists(file));
});

check("Home is strict one-card wizard", home.includes('screen === "welcome"') && home.includes('screen === "purpose"') && home.includes('screen === "song"') && home.includes('screen === "kk"'));
check("Home asks only one main question at a time", home.includes("What is this HUG for?") && home.includes("Pick a song.") && home.includes("Choose the song moment."));
check("Home has founder welcome replay", home.includes("Play Founder Welcome") && home.includes("Replay Founder Welcome"));
check("Home remembers founder welcome heard state", home.includes("k-kut-gp-bot-founder-welcome-heard"));
check("Home has clear understand action", home.includes("I understand — pick what this is for"));
check("Home routes confusion to demo link", home.includes("I don’t understand — show me the demo") && home.includes("/hug/mothers-day"));
check("Home has direct live buy path", home.includes("Buy live Mother’s Day HUG now") && home.includes('href="/hug/mothers-day"'));
check("Home uses music bullets", home.includes("♪") && home.includes("♬") && home.includes("♫"));
check("Home has KK options", home.includes("K-KUT Option") && (home.includes("Choose this one") || home.includes("Choose this HUG")));
check("Home avoids decorative BOT badge", !home.includes("MC-BOT guide · GP-BOT voice"));
check("Home avoids auto-help timers", !home.includes("5000") && !home.includes("12000"));
check("Home avoids current action box", !home.includes("CURRENT ACTION"));
check("Home avoids progress box", !home.includes("PROGRESS"));
check("Home avoids false coming soon dead end", !home.includes("This one is coming soon. Try Mother"));
check("Home avoids 18A internal label", !home.includes("18A"));
check("Home enforces one audio at a time", home.includes("stopAllAudio") && home.includes("playOneAudio"));

check("Mother's Day has playBotVoice function", mothers.includes("playBotVoice"));
check("Mother's Day uses GP-BOT prompt path", mothers.includes("/voices/") && mothers.includes("/prompts/"));
check("Mother's Day has Play demo button", mothers.includes("Play demo"));
check("Mother's Day has Choose this HUG button", mothers.includes("Choose this HUG"));
check("Mother's Day has checkout price button", mothers.includes("Checkout") || mothers.includes("checkout"));
check("Mother's Day has Stripe link", mothers.includes("stripe") || mothers.includes("STRIPE_URL"));

let pass = 0;
let fail = 0;

checks.forEach((item) => {
  if (item.ok) {
    pass++;
    console.log(`PASS - ${item.name}`);
  } else {
    fail++;
    console.log(`FAIL - ${item.name}`);
  }
});

console.log("\nSUMMARY");
console.log("=======");
console.log(`Total: ${checks.length}`);
console.log(`Pass:  ${pass}`);
console.log(`Fail:  ${fail}`);

if (fail > 0) {
  process.exit(1);
}
