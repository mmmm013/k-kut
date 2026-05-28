import fs from "node:fs";

const checks = [];

function pass(name, detail = "") {
  checks.push({ name, status: "PASS", detail });
}

function fail(name, detail = "") {
  checks.push({ name, status: "FAIL", detail });
}

function fileExists(path) {
  return fs.existsSync(path) && fs.statSync(path).isFile();
}

function read(path) {
  return fs.existsSync(path) ? fs.readFileSync(path, "utf8") : "";
}

const tugScript = "lib/tugMcBotScript.ts";
const tugPage = "app/tug/page.tsx";
const wholeAudio = "public/audio/mc-bot/tug/script-whole-2.m4a";

if (fileExists(tugScript)) pass("MC-BOT TUG script file exists", tugScript);
else fail("MC-BOT TUG script file exists", tugScript);

if (fileExists(tugPage)) pass("TUG page exists", tugPage);
else fail("TUG page exists", tugPage);

if (fileExists(wholeAudio)) {
  const size = fs.statSync(wholeAudio).size;
  if (size > 1000000) pass("Real MC-BOT whole audio exists", `${wholeAudio} (${Math.round(size / 1024 / 1024 * 10) / 10} MB)`);
  else fail("Real MC-BOT whole audio exists", `${wholeAudio} too small`);
} else {
  fail("Real MC-BOT whole audio exists", wholeAudio);
}

const scriptText = read(tugScript);
const pageText = read(tugPage);

if (scriptText.includes("/audio/mc-bot/tug/script-whole-2.m4a")) {
  pass("TUG script binds real whole audio path");
} else {
  fail("TUG script binds real whole audio path");
}

if (pageText.includes("tugMcBotWholeAudioSrc") || pageText.includes("script-whole-2.m4a")) {
  pass("TUG page references MC-BOT audio");
} else {
  fail("TUG page references MC-BOT audio");
}

if (pageText.includes("<audio") && pageText.includes("controls") && pageText.includes("preload=\"none\"")) {
  pass("MC-BOT audio is user-controlled");
} else {
  fail("MC-BOT audio is user-controlled", "Need audio controls with preload=\"none\"");
}

const banned = ["autoplay", "generated voice fallback", "fake voice"];
const lower = pageText.toLowerCase() + "\n" + scriptText.toLowerCase();

if (!lower.includes("autoplay={true}") && !lower.includes("autoPlay")) {
  pass("No autoplay implementation detected");
} else {
  fail("No autoplay implementation detected");
}

if (scriptText.includes("noGeneratedVoiceFallback: true") || pageText.includes("No fake voice")) {
  pass("No generated/fake voice doctrine present");
} else {
  fail("No generated/fake voice doctrine present");
}

if (pageText.includes("Step") || pageText.includes("one step")) {
  pass("TUG page communicates step guidance");
} else {
  fail("TUG page communicates step guidance");
}

const failed = checks.filter((c) => c.status === "FAIL");

console.log("# MC-BOT Health Check");
for (const c of checks) {
  console.log(`${c.status === "PASS" ? "✅" : "❌"} ${c.name}${c.detail ? ` — ${c.detail}` : ""}`);
}

if (failed.length) {
  console.error(`\nMC-BOT HEALTH: FAIL (${failed.length} issue(s))`);
  process.exit(1);
}

console.log("\nMC-BOT HEALTH: PASS");
