import fs from "node:fs";

const files = {
  personalIndex: "app/personal/page.tsx",
  personalSlug: "app/personal/[slug]/page.tsx",
  birthday: "app/personal/birthday/page.tsx",
  systemMap: "data/system-map/k-kut-system-map.json"
};

let failed = false;

function fail(message) {
  console.error("FAIL:", message);
  failed = true;
}

function read(path) {
  if (!fs.existsSync(path)) {
    fail(`Missing ${path}`);
    return "";
  }
  return fs.readFileSync(path, "utf8");
}

console.log("PERSONAL PATHWAY AUDIT");

const personalIndex = read(files.personalIndex);
const personalSlug = read(files.personalSlug);
const birthday = read(files.birthday);
const systemMap = JSON.parse(read(files.systemMap) || "{}");

for (const phrase of [
  "K-KUT Personal HUGs",
  "Hear Birthday HUGs",
  "Find the right HUG with MC-BOT",
  "Featured audio-backed promos"
]) {
  if (!personalIndex.includes(phrase)) {
    fail(`Personal index missing phrase: ${phrase}`);
  }
}

for (const phrase of [
  "const isSympathy",
  'slug === "sympathy"',
  'slug === "grief"',
  'slug === "memorial"',
  'slug === "celebration-of-life"',
  "Sympathy HUGs require a stricter human review before public selection.",
  "No generic personal HUG cards are shown here.",
  "Mood, level,"
]) {
  if (!personalSlug.includes(phrase)) {
    fail(`Personal slug hold missing phrase: ${phrase}`);
  }
}

const holdBlockMatch = personalSlug.match(/if \(isSympathy\)[\s\S]*?return \([\s\S]*?\);\s*\}/);
if (!holdBlockMatch) {
  fail("Could not locate high-risk Sympathy hold return block.");
} else {
  const holdBlock = holdBlockMatch[0];

  for (const forbidden of [
    "checkoutUrl",
    "buy.stripe.com",
    "<audio",
    "Send this Personal HUG"
  ]) {
    if (holdBlock.includes(forbidden)) {
      fail(`High-risk hold block contains forbidden content: ${forbidden}`);
    }
  }
}

for (const phrase of [
  "Birthday K-KUT HUGs",
  "Choose a birthday tone. Press play. Send a private GPM HUG.",
  "Send this Birthday HUG",
  "<audio"
]) {
  if (!birthday.includes(phrase)) {
    fail(`Birthday page missing expected buyer phrase: ${phrase}`);
  }
}

const personalPath = systemMap.public_buyer_paths?.find((row) => row.path === "/personal");
if (!personalPath) {
  fail("System map missing /personal pathway.");
} else {
  if (!String(personalPath.purpose || "").includes("Personal HUG lane index")) {
    fail("/personal system-map purpose is wrong.");
  }
  if (!Array.isArray(personalPath.must_not_show) || !personalPath.must_not_show.includes("mK language")) {
    fail("/personal system-map must block mK language.");
  }
}

const sympathyPath = systemMap.public_buyer_paths?.find((row) => row.path === "/personal/sympathy");
if (!sympathyPath) {
  fail("System map missing /personal/sympathy pathway.");
} else {
  if (sympathyPath.payment_allowed !== false) fail("/personal/sympathy must block payment.");
  if (sympathyPath.audio_allowed !== false) fail("/personal/sympathy must block audio.");
}

for (const publicBuyerFile of [personalIndex, personalSlug, birthday]) {
  for (const forbidden of [
    "candidate_not_approved",
    "debug",
    "staging",
    "test example",
    "mini-KUT",
    "mkut"
  ]) {
    if (publicBuyerFile.includes(forbidden)) {
      fail(`Public personal file contains forbidden public leak term: ${forbidden}`);
    }
  }
}

if (failed) {
  console.error("PERSONAL PATHWAY AUDIT: FAIL");
  process.exit(1);
}

console.log("PERSONAL PATHWAY AUDIT: PASS");
