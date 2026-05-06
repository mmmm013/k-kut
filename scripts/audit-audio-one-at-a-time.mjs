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

console.log("\nK-KUT ONE-AUDIO AUDIT");
console.log("=====================\n");

for (const file of files) {
  const text = fs.readFileSync(file, "utf8");

  check(`${file} has activeKkutAudio controller`, text.includes("activeKkutAudio"));
  check(`${file} stops active audio before new play`, text.includes("stopAllAudio();") && text.includes("activeKkutAudio.pause()"));
  check(`${file} resets audio to zero`, text.includes("currentTime = 0"));
  check(`${file} clears audio on page leave`, text.includes("pagehide") && text.includes("beforeunload"));
  check(`${file} uses playOneAudio`, text.includes("function playOneAudio"));
}

const home = fs.readFileSync("app/page.tsx", "utf8");

check("Homepage keeps one-step screens", home.includes('screen === "welcome"') && home.includes('screen === "purpose"') && home.includes('screen === "type"') && home.includes('screen === "song"') && home.includes('screen === "kk"') && home.includes('screen === "confirm"') && home.includes('screen === "buy"'));
check("Homepage has no dashboard panels", !home.includes("Current Action") && !home.includes("Progress") && !home.includes("BB-BOT guide"));
check("Homepage keeps full options per step", home.includes("PURPOSES.map") && home.includes("typeChoices.map") && home.includes("visibleSongs.map") && home.includes("kkOptions.map"));

console.log("\nSUMMARY");
console.log("=======");
console.log(`Fail: ${failures.length}`);

if (failures.length) process.exit(1);
