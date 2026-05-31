import fs from "node:fs";

const birthdayPath = "app/personal/birthday/page.tsx";
let failed = false;

function fail(message) {
  console.error("FAIL:", message);
  failed = true;
}

console.log("BIRTHDAY PATHWAY AUDIT");

if (!fs.existsSync(birthdayPath)) {
  fail(`Missing ${birthdayPath}`);
} else {
  const src = fs.readFileSync(birthdayPath, "utf8");

  for (const phrase of [
    "Birthday K-KUT HUGs",
    "Choose a birthday tone. Press play. Send a private GPM HUG.",
    "Customer delivery audio includes padding and the GPM signature end sound.",
    "Send this Birthday HUG",
    "<audio",
    "checkoutUrl"
  ]) {
    if (!src.includes(phrase)) fail(`Birthday page missing: ${phrase}`);
  }

  const audioCount = (src.match(/audioUrl:/g) || []).length;
  const checkoutCount = (src.match(/checkoutUrl:/g) || []).length;

  if (audioCount < 1) fail("Birthday page must include at least one audioUrl.");
  if (checkoutCount < 1) fail("Birthday page must include at least one checkoutUrl.");

  for (const forbidden of [
    "candidate_not_approved",
    "debug",
    "staging",
    "test example",
    "mini-KUT",
    "mkut",
    "sympathy",
    "grief",
    "memorial",
    "celebration-of-life"
  ]) {
    if (src.includes(forbidden)) fail(`Birthday page contains forbidden term: ${forbidden}`);
  }
}

if (failed) {
  console.error("BIRTHDAY PATHWAY AUDIT: FAIL");
  process.exit(1);
}

console.log("BIRTHDAY PATHWAY AUDIT: PASS");
