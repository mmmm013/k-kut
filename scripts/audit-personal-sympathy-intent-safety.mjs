import fs from "node:fs";

const pagePath = "app/personal/[slug]/page.tsx";
const text = fs.readFileSync(pagePath, "utf8");

let failed = false;

function fail(message) {
  console.error("FAIL:", message);
  failed = true;
}

console.log("PERSONAL SYMPATHY INTENT SAFETY AUDIT");

for (const slug of ["sympathy", "grief", "memorial", "celebration-of-life"]) {
  if (!text.includes(`slug === "${slug}"`)) {
    fail(`Missing held slug: ${slug}`);
  }
}

for (const phrase of [
  "No generic personal HUG cards are shown here",
  "Mood, level, softness, care, warmth, or slow metadata is not enough",
  "KKr Intent Safety Gate"
]) {
  if (!text.includes(phrase)) {
    fail(`Missing safety phrase: ${phrase}`);
  }
}

const blockStart = text.indexOf("if (isSympathyHold)");
const blockEnd = text.indexOf("return (", blockStart + 1);
const holdBlock = blockStart >= 0 && blockEnd > blockStart
  ? text.slice(blockStart, blockEnd)
  : "";

if (!holdBlock) {
  fail("Could not isolate held sympathy/grief/memorial block.");
}

for (const forbidden of [
  "A Love Like That",
  "Don't Call It Love",
  "Your Heart Poundin'",
  "checkoutUrl",
  "Send this Personal HUG",
  "<audio"
]) {
  if (holdBlock.includes(forbidden)) {
    fail(`Held block contains forbidden buyer/audio content: ${forbidden}`);
  }
}

if (failed) {
  console.error("PERSONAL SYMPATHY INTENT SAFETY AUDIT: FAIL");
  process.exit(1);
}

console.log("PERSONAL SYMPATHY INTENT SAFETY AUDIT: PASS");
