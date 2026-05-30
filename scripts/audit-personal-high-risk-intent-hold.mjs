import fs from "node:fs";

const pagePath = "app/personal/[slug]/page.tsx";
const text = fs.readFileSync(pagePath, "utf8");

let failed = false;

function fail(msg) {
  console.error("FAIL:", msg);
  failed = true;
}

console.log("PERSONAL HIGH-RISK INTENT HOLD AUDIT");

for (const slug of ["sympathy", "grief", "memorial", "celebration-of-life"]) {
  if (!text.includes(`slug === "${slug}"`)) {
    fail(`Missing held slug: ${slug}`);
  }
}

for (const phrase of [
  "stricter human review",
  "No generic personal HUG cards are shown here",
  "Mood, level",
  "music must match the human situation first"
]) {
  if (!text.includes(phrase)) {
    fail(`Missing hold phrase fragment: ${phrase}`);
  }
}

const blockStart =
  text.indexOf("if (isSympathy)") >= 0
    ? text.indexOf("if (isSympathy)")
    : text.indexOf("if (isHighRiskIntentHold)");

const blockEnd = text.indexOf("return (", blockStart + 1);

const holdBlock =
  blockStart >= 0 && blockEnd > blockStart
    ? text.slice(blockStart, blockEnd)
    : "";

if (!holdBlock) {
  fail("Could not isolate high-risk hold block.");
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
    fail(`High-risk hold block contains forbidden content: ${forbidden}`);
  }
}

if (failed) {
  console.error("PERSONAL HIGH-RISK INTENT HOLD AUDIT: FAIL");
  process.exit(1);
}

console.log("PERSONAL HIGH-RISK INTENT HOLD AUDIT: PASS");
