import fs from "node:fs";

const home = fs.readFileSync("app/page.tsx", "utf8");
const doctrine = fs.readFileSync("docs/ux/HUG_GUIDED_CHOICE_PROCESS.md", "utf8");
const failures = [];

function check(name, ok) {
  console.log(`${ok ? "PASS" : "FAIL"} - ${name}`);
  if (!ok) failures.push(name);
}

console.log("\nK-KUT GUIDED CHOICE PROCESS AUDIT");
console.log("=================================\n");

check("Doctrine exists", doctrine.includes("General") && doctrine.includes("narrower") && doctrine.includes("user satisfied"));
check("Doctrine states quantity never beats fit", doctrine.includes("Quantity never beats fit"));
check("Doctrine includes user freedom paths", doctrine.includes("Go back") && doctrine.includes("Ask for another set"));
check("Doctrine forbids internal labels", doctrine.includes("Internal labels") && doctrine.includes("18A"));

check("Homepage has broad purpose step", home.includes('screen === "purpose"') && home.includes("What is this HUG for?"));
check("Homepage has narrower emotional lane step", home.includes('screen === "type"') && home.includes("Choose the kind"));
check("Homepage has song set step", home.includes('screen === "song"') && home.includes("Pick a song."));
check("Homepage has K-KUT option step", home.includes('screen === "kk"') && home.includes("Choose your K-KUT moment."));
check("Homepage has confirm step", home.includes('screen === "confirm"') && home.includes("Is this the one?"));
check("Homepage has checkout step", home.includes('screen === "buy"') && home.includes("Buy this HUG."));

check("Homepage supports another song set", home.includes("Show me another set") || home.includes("Start song list again"));
check("Homepage states fit-only song rule", home.includes("We only show songs that fit this choice."));
check("Homepage has back path", home.includes("function goBack()"));
check("Homepage has demo path", home.includes("I don’t understand") && home.includes("/hug/mothers-day"));

check("Homepage avoids 18A", !home.includes("18A"));
check("Homepage avoids ASCAP in choice flow", !home.includes("ASCAP"));
check("Homepage avoids current-action panel", !home.includes("CURRENT ACTION") && !home.includes("Current Action"));
check("Homepage avoids progress panel", !home.includes("PROGRESS") && !home.includes("Progress"));
check("Homepage avoids decorative BOT badge", !home.includes("MC-BOT guide"));
check("Homepage avoids false coming soon dead end", !home.includes("This one is coming soon. Try Mother"));
check("Homepage enforces one audio at a time", home.includes("stopAllAudio") && home.includes("playOneAudio"));

console.log("\nSUMMARY");
console.log("=======");
console.log(`Fail: ${failures.length}`);

if (failures.length) process.exit(1);
