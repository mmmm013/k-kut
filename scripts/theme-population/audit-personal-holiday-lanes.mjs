import fs from "node:fs";

const file = "data/theme-population/lane-seeds/personal-holiday-lanes.seed.json";
const data = JSON.parse(fs.readFileSync(file, "utf8"));

const failures = [];

console.log("# PERSONAL + HOLIDAY LANE SEED AUDIT");
console.log(`status: ${data.status}`);
console.log(`personal_lanes: ${data.personal_lanes.length}`);
console.log(`holiday_lanes: ${data.holiday_lanes.length}`);

for (const lane of [...data.personal_lanes, ...data.holiday_lanes]) {
  if (!lane.lane) failures.push("missing lane id");
  if (!lane.route) failures.push(`${lane.lane}: missing route`);
  if (!lane.buyer_purpose) failures.push(`${lane.lane}: missing buyer_purpose`);
  if (!lane.themes || lane.themes.length === 0) failures.push(`${lane.lane}: missing themes`);
  if (!lane.current_level) failures.push(`${lane.lane}: missing current_level`);
  if (!lane.public_status) failures.push(`${lane.lane}: missing public_status`);
  if (!lane.next_action) failures.push(`${lane.lane}: missing next_action`);
}

const requiredRoutes = [
  "/personal",
  "/personal/birthday",
  "/personal/anniversary",
  "/personal/apology",
  "/romance",
  "/wedding",
  "/holiday",
  "/mothers-day/thank-you"
];

const text = JSON.stringify(data);
for (const route of requiredRoutes) {
  if (!text.includes(route)) failures.push(`missing required route: ${route}`);
}

console.log(`failures: ${failures.length}`);

if (failures.length) {
  for (const failure of failures) console.log(`- ${failure}`);
  process.exitCode = 2;
} else {
  console.log("AUDIT PASS");
}
