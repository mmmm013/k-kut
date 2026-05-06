import fs from "node:fs";

const home = fs.readFileSync("app/page.tsx", "utf8");
const failures = [];

function check(name, ok) {
  console.log(`${ok ? "PASS" : "FAIL"} - ${name}`);
  if (!ok) failures.push(name);
}

console.log("\nK-KUT AUDIO INTEGRITY AUDIT");
console.log("===========================\n");

check(
  "No generated fake KK playable text",
  !home.includes('A prepared K-KUT option for')
);

check(
  "Play button is gated by real audio",
  home.includes("{item.audio ?")
);

check(
  "Missing audio does not show dead Play button",
  home.includes("Preview not loaded yet")
);

check(
  "No BOT voice fallback on KK preview missing",
  !home.includes('playBotVoice("play-demo");')
);

check(
  "One audio helper still exists",
  home.includes("playOneAudio") && home.includes("stopAllAudio")
);

console.log("\nSUMMARY");
console.log("=======");
console.log(`Fail: ${failures.length}`);

if (failures.length) process.exit(1);
