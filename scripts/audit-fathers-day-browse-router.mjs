import fs from "node:fs";

const routerPath = "data/fathers-day/fathers-day-more-router.json";
const docPath = "docs/4pe-learning/BROWSE_RETURN_LOCATION_RULE.md";

let fail = false;

function read(p) {
  if (!fs.existsSync(p)) {
    console.error("FAIL missing", p);
    fail = true;
    return "";
  }
  console.log("OK exists", p);
  return fs.readFileSync(p, "utf8");
}

const routerText = read(routerPath);
const doc = read(docPath);
const router = routerText ? JSON.parse(routerText) : {};

for (const id of [
  "dad-cowboy",
  "dad-funny",
  "dad-hardworking",
  "dad-quiet",
  "dad-bonus"
]) {
  if (!(router.buyer_groups || []).some((g) => g.id === id)) {
    console.error("FAIL missing group", id);
    fail = true;
  } else {
    console.log("OK group", id);
  }
}

for (const phrase of [
  "Stable HOME",
  "Back to Father’s Day",
  "More means deeper qualified options",
  "Cowboy / Western Dad"
]) {
  if (!doc.includes(phrase) && !routerText.includes(phrase)) {
    console.error("FAIL missing phrase", phrase);
    fail = true;
  } else {
    console.log("OK phrase", phrase);
  }
}

if (router.release_state !== "not_public_until_delivery_audio_and_bic_pass") {
  console.error("FAIL unsafe release state");
  fail = true;
} else {
  console.log("OK release state remains admin-only");
}

if (fail) process.exit(1);

console.log("PASS: Father’s Day browse router has under-layers and stable return doctrine.");
