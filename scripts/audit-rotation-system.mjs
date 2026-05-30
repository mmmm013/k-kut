import fs from "node:fs";

const p = "data/rotation/holiday-season-rotation-system.json";

if (!fs.existsSync(p)) {
  console.error("FAIL: missing rotation system file:", p);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(p, "utf8"));

const requiredTop = [
  "locked_context",
  "rotation_layers",
  "candidate_laws",
  "metadata_policy",
  "current_priority"
];

let fail = false;

for (const key of requiredTop) {
  if (!(key in data)) {
    console.error("FAIL: missing key", key);
    fail = true;
  } else {
    console.log("OK", key);
  }
}

const layerIds = new Set((data.rotation_layers || []).map((x) => x.id));
for (const id of [
  "specific_holiday",
  "calendar_season",
  "evergreen_use_case",
  "weekly_exposure_balancer"
]) {
  if (!layerIds.has(id)) {
    console.error("FAIL: missing rotation layer", id);
    fail = true;
  } else {
    console.log("OK layer", id);
  }
}

const laws = JSON.stringify(data.candidate_laws || []);
for (const required of ["No INSTRO", "No direct same-holiday", "No mKs", "padding + Twinkle"]) {
  if (!laws.toLowerCase().includes(required.toLowerCase())) {
    console.error("FAIL: missing law signal", required);
    fail = true;
  } else {
    console.log("OK law", required);
  }
}

if (fail) process.exit(1);

console.log("PASS: holiday-season rotation system doctrine is present.");
