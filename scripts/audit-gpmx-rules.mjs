import fs from "node:fs";

const failures = [];

function check(name, ok) {
  console.log(`${ok ? "PASS" : "FAIL"} - ${name}`);
  if (!ok) failures.push(name);
}

const mothers = fs.readFileSync("app/hug/mothers-day/page.tsx", "utf8");
const home = fs.readFileSync("app/page.tsx", "utf8");

console.log("\nGPMx RULE AUDIT");
console.log("================\n");

check("Rule 1: Mother’s Day labels MC-BOT", mothers.includes("MC-BOT"));
check("Rule 1: Mother’s Day has no GP-BOT label", !mothers.includes("GP-BOT"));
check("Rule 1: Mother’s Day has no gp-bot path", !mothers.includes("gp-bot"));
check("Rule 1: Mother’s Day has no /voices/ fallback", !mothers.includes("/voices/"));
check("Rule 1: Mother’s Day uses MC-BOT function naming", mothers.includes("playMcBotVoice"));

check("Rule 2: Homepage may label GP-BOT Founder", home.includes("GP-BOT") && home.includes("Founder"));
check("Rule 2: Founder click may use KLEIGH audio", home.includes("/audio/kleigh/guide-final/33-welcome.m4a"));

check("Rule 3: Mother’s Day sells private HUG link", mothers.includes("private HUG link"));
check("Rule 3: Mother’s Day states no file download", mothers.includes("No file download"));
check("Rule 3: Mother’s Day has no download CTA", !mothers.includes("Download"));

check("Rule 5: Mother’s Day stops other demo audio from buttons", mothers.includes("stopOtherDemoAudio(el)"));
check("Rule 5: Mother’s Day stops other demo audio from native controls", mothers.includes("stopOtherDemoAudio(event.currentTarget)"));

console.log("\nSUMMARY");
console.log("=======");
console.log(`Fail: ${failures.length}`);

if (failures.length) {
  console.log("\nFAILURES");
  console.log("========");
  failures.forEach((failure) => console.log(`FAIL - ${failure}`));
  process.exit(1);
}
