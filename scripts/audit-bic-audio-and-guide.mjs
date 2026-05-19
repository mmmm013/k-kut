import fs from "node:fs";

const files = [
  "app/page.tsx",
  "app/hug/mothers-day/page.tsx",
];

const failures = [];

function check(name, ok) {
  console.log(`${ok ? "PASS" : "FAIL"} - ${name}`);
  if (!ok) failures.push(name);
}

console.log("\nBIC AUDIO + GUIDE AUDIT");
console.log("=======================\n");

for (const file of files) {
  const text = fs.readFileSync(file, "utf8");

  check(`${file} has active audio controller`, text.includes("activeKkutAudio"));
  check(`${file} stops active audio before next play`, text.includes("activeKkutAudio.pause()"));
  check(`${file} resets audio to zero`, text.includes("currentTime = 0"));
  check(`${file} clears audio on page leave`, text.includes("pagehide") && text.includes("beforeunload"));
  check(`${file} has playOneAudio`, text.includes("function playOneAudio"));
}

const home = fs.readFileSync("app/page.tsx", "utf8");

check("Homepage remains one-step wizard", home.includes('screen === "welcome"') && home.includes('screen === "purpose"') && home.includes('screen === "type"') && home.includes('screen === "song"') && home.includes('screen === "kk"') && home.includes('screen === "confirm"') && home.includes('screen === "buy"'));
check("Homepage keeps full options per step", home.includes("PURPOSES.map") && home.includes("typeChoices.map") && home.includes("visibleSongs.map") && home.includes("kkOptions.map"));
check("Homepage has guide language", home.includes("One step at a time") && home.includes("Now narrow it") && home.includes("Here are fitting songs") && home.includes("Now choose your K-KUT moment"));
check("Homepage avoids control-panel clutter", !home.includes("Current Action") && !home.includes("Progress") && !home.includes("MC-BOT guide"));
check("Homepage avoids internal labels", !home.includes("18A") && !home.includes("ASCAP"));

console.log("\nSUMMARY");
console.log("=======");
console.log(`Fail: ${failures.length}`);

if (failures.length) process.exit(1);
