import fs from "node:fs";

const p = "data/theme-feed/theme-feed-system.json";
const doc = "docs/4pe-learning/THEME_FEED_AND_MC_BOT_SYSTEM.md";

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

for (const role of ["PIX", "KK", "II", "KKr", "MC-BOT", "BIC"]) {
  if (!data.roles || !data.roles[role]) {
    console.error("FAIL missing role", role);
    fail = true;
  } else {
    console.log("OK role", role);
  }
}

for (const layer of [
  "occasion",
  "holiday",
  "calendar_season",
  "relationship",
  "POV",
  "buyer_identity",
  "emotion_level",
  "phrase_meaning",
  "exclusion_law",
  "weekly_exposure"
]) {
  if (!(data.theme_layers || []).includes(layer)) {
    console.error("FAIL missing layer", layer);
    fail = true;
  } else {
    console.log("OK layer", layer);
  }
}

for (const theme of [
  "fathers-day",
  "mothers-day",
  "birthday",
  "thank-you",
  "apology",
  "encouragement",
  "comfort-grief",
  "romance",
  "wedding"
]) {
  if (!(data.theme_groups || []).some((x) => x.id === theme)) {
    console.error("FAIL missing theme", theme);
    fail = true;
  } else {
    console.log("OK theme", theme);
  }
}

for (const phrase of [
  "MC-BOT is involved",
  "Featured first",
  "More like this",
  "BIC production audit",
  "Cowboy / Western Dad"
]) {
  if (!docText.includes(phrase) && !raw.includes(phrase)) {
    console.error("FAIL missing phrase", phrase);
    fail = true;
  } else {
    console.log("OK phrase", phrase);
  }
}

if (fail) process.exit(1);

console.log("PASS: Theme Feed + MC-BOT system is present.");
