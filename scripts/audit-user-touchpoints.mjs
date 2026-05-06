import fs from "node:fs";

const home = fs.readFileSync("app/page.tsx", "utf8");
const mothers = fs.readFileSync("app/hug/mothers-day/page.tsx", "utf8");

const failures = [];

function check(name, ok) {
  console.log(`${ok ? "PASS" : "FAIL"} - ${name}`);
  if (!ok) failures.push(name);
}

console.log("\nK-KUT USER TOUCHPOINT AUDIT");
console.log("===========================\n");

check("Homepage has welcome screen", home.includes('screen === "welcome"'));
check("Homepage has purpose screen", home.includes('screen === "purpose"'));
check("Homepage has narrower type screen", home.includes('screen === "type"'));
check("Homepage has song screen", home.includes('screen === "song"'));
check("Homepage has K-KUT options screen", home.includes('screen === "kk"'));
check("Homepage has confirm screen", home.includes('screen === "confirm"'));
check("Homepage has buy screen", home.includes('screen === "buy"'));

check("Homepage has guided start", home.includes("I understand") && home.includes("startFlow"));
check("Homepage has demo path", home.includes("I don") && home.includes("/hug/mothers-day"));
check("Homepage has live Mother’s Day buy path", home.includes("Buy live Mother") && home.includes("/hug/mothers-day"));

check("Hard Feelings has user-friendly lanes", home.includes('title: "Sorry"') && home.includes('title: "Reflection"') && home.includes('title: "Hurt"') && home.includes('title: "Cry"') && home.includes('title: "Sorrow / Break Up"'));

check("Song set supports another set or restart", home.includes("Show me another set") || home.includes("Start song list again"));
check("Song set states fit-only rule", home.includes("We only show songs that fit this choice."));

check("K-KUT options show choose action", home.includes("Choose this one"));
check("K-KUT options gate Play behind audio", home.includes("{item.audio ?"));
check("K-KUT options show Preview loading when audio missing", home.includes("Preview loading"));

check("Back function exists", home.includes("function goBack()"));
check("Checkout action exists", home.includes("Continue to checkout"));

check("Homepage has Stripe or live checkout route", home.includes("buy.stripe.com") || home.includes("/hug/mothers-day"));
check("Mother’s Day page has Stripe", mothers.includes("buy.stripe.com") || mothers.includes("STRIPE_URL"));
check("Mother’s Day page has Play demo", mothers.includes("Play demo"));
check("Mother’s Day page has Choose this HUG", mothers.includes("Choose this HUG"));

check("No 18A internal label", !home.includes("18A") && !mothers.includes("18A"));
check("No ASCAP in user choice flow", !home.includes("ASCAP"));
check("No Current Action panel", !home.includes("CURRENT ACTION") && !home.includes("Current Action"));
check("No Progress panel", !home.includes("PROGRESS") && !home.includes("Progress"));
check("No decorative BOT badge", !home.includes("BB-BOT guide"));
check("No fake coming soon dead end", !home.includes("This one is coming soon. Try Mother"));

check("One-audio helper exists", home.includes("stopAllAudio") && home.includes("playOneAudio"));
check("Welcome not called from buy screen", !/screen === "buy"[\s\S]*playBotVoice\("welcome"\)/.test(home));

console.log("\nSUMMARY");
console.log("=======");
console.log(`Fail: ${failures.length}`);

if (failures.length) {
  console.log("\nFAILURES");
  console.log("========");
  failures.forEach((failure) => console.log(`FAIL - ${failure}`));
  process.exit(1);
}
