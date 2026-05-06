import fs from "node:fs";

const home = fs.readFileSync("app/page.tsx", "utf8");
const failures = [];

function check(name, ok) {
  console.log(`${ok ? "PASS" : "FAIL"} - ${name}`);
  if (!ok) failures.push(name);
}

console.log("\nK-KUT INTENT REFINEMENT AUDIT");
console.log("=============================\n");

check("Homepage has intent screen", home.includes('screen === "intent"'));
check("Homepage has intent state", home.includes("intentId"));
check("Homepage has intent choice map", home.includes("const INTENT_CHOICES"));
check("Type step leads to intent step", home.includes('setScreen("intent")'));
check("Intent step leads to song step", home.includes("function chooseIntent") && home.includes('setScreen("song")'));
check("Song choices come from selected intent", home.includes("intentChoice.songs"));
check("Hard Feelings Hurt has six intent buttons", home.includes('id: "heartbreak"') && home.includes('id: "disappointment"') && home.includes('id: "emotional-injury"') && home.includes('id: "still-angry"') && home.includes('id: "missing-them"') && home.includes('id: "letting-go"'));
check("All major purposes have intent refinement", home.includes("love: {") && home.includes("gratitude: {") && home.includes('"hard-feelings": {') && home.includes("celebration: {") && home.includes("comfort: {"));
check("Intent is shown on confirm", home.includes("Intent: {intentChoice.title}"));

console.log("\nSUMMARY");
console.log("=======");
console.log(`Fail: ${failures.length}`);

if (failures.length) process.exit(1);
