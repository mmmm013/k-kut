import fs from "node:fs";

const file = "app/hug/page.tsx";
let failed = false;

function fail(msg) {
  console.error("FAIL:", msg);
  failed = true;
}

if (!fs.existsSync(file)) {
  fail("Missing app/hug/page.tsx");
} else {
  const text = fs.readFileSync(file, "utf8");
  const lower = text.toLowerCase();

  const required = [
    "K-KUT HUGs",
    "Personal HUGs",
    "Holiday HUGs",
    "Father’s Day HUGs",
    "MC-BOT guide",
    "Ask MC-BOT to help me choose",
    "/personal",
    "/holiday",
    "/holiday/fathers-day",
    "/ii-delivery/romance/",
    "bookend-twinkle"
  ];

  const forbidden = [
    "NVA",
    "SSOT",
    "supabase.co/storage",
    "raw KK",
    "mini-KUT",
    "mk-products",
    "runtime Twinkle",
    "append Twinkle"
  ];

  for (const term of required) {
    if (!text.includes(term)) fail(`Missing required text/path: ${term}`);
  }

  for (const term of forbidden) {
    if (lower.includes(term.toLowerCase())) fail(`Forbidden / unsafe copy found: ${term}`);
  }

  const audioTags = (text.match(/<audio/g) || []).length;
  if (audioTags !== 1) fail(`Expected exactly one audio player, found ${audioTags}`);

  if (!text.includes("bg-[#09070b]")) fail("Missing brown/black base background.");
  if (!text.includes("#FFD54F")) fail("Missing gold accent.");
  if (!text.includes("#8D6E63")) fail("Missing brown border accent.");
}

if (failed) {
  console.error("HUG UI PATCH AUDIT: FAIL");
  process.exit(1);
}

console.log("HUG UI PATCH AUDIT: PASS");
