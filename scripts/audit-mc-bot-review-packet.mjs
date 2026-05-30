import fs from "node:fs";

const p = "data/mc-bot/mc-bot-review-packet.json";
const doc = "docs/4pe-learning/MC_BOT_REVIEW_PACKET_RULE.md";

let fail = false;

function read(path) {
  if (!fs.existsSync(path)) {
    console.error("FAIL missing", path);
    fail = true;
    return "";
  }
  console.log("OK exists", path);
  return fs.readFileSync(path, "utf8");
}

const raw = read(p);
const docText = read(doc);
const data = raw ? JSON.parse(raw) : {};

const phraseCount = (data.current_theme_branches || [])
  .flatMap((b) => b.phrases || [])
  .length;

console.log("Phrase count:", phraseCount);

if (data.send_state !== "do_not_email_yet") {
  console.error("FAIL unsafe send_state");
  fail = true;
} else {
  console.log("OK send_state");
}

if (phraseCount < 10) {
  console.error("FAIL too few starter phrases");
  fail = true;
} else {
  console.log("OK starter phrase count");
}

for (const phrase of [
  "Email MC only",
  "Do not send scattered fragments",
  "Natural Michael Clay pace",
  "Do not send without user approval"
]) {
  if (!docText.includes(phrase) && !raw.includes(phrase)) {
    console.error("FAIL missing phrase", phrase);
    fail = true;
  } else {
    console.log("OK phrase", phrase);
  }
}

if (fail) process.exit(1);

console.log("PASS: MC-BOT review packet rule is present.");
