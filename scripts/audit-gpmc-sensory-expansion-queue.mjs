import fs from "node:fs";

const queuePath = "data/gpmc-sensory/sensory-expansion-queue.json";

let failed = false;

function fail(message) {
  console.error("FAIL:", message);
  failed = true;
}

console.log("GPMC SENSORY EXPANSION QUEUE AUDIT");

if (!fs.existsSync(queuePath)) {
  fail(`Missing ${queuePath}`);
} else {
  const raw = fs.readFileSync(queuePath, "utf8");
  const data = JSON.parse(raw);

  if (data.current_approved_public_seed_count !== 6) {
    fail("Current approved-public seed count must be labeled as 6.");
  }

  for (const phrase of [
    "not the full GPM PIX catalog",
    "not the full K-KUT inventory",
    "not the emotional-sensory ceiling",
    "Never expose raw inventory directly",
    "Do not slice thinner than human meaning",
    "Only approved_public records may flow to buyer routes",
    "Keep per-user caring history opt-in and non-manipulative"
  ]) {
    if (!raw.includes(phrase)) fail(`Missing required phrase: ${phrase}`);
  }

  const requiredLanes = [
    "thank_you_gratitude",
    "birthday_lift",
    "encouragement_strength",
    "friendship_seen",
    "missing_you_memory",
    "apology_repair",
    "anniversary_devotion",
    "grief_held"
  ];

  const lanes = new Set((data.expansion_lanes || []).map((lane) => lane.lane_id));

  for (const lane of requiredLanes) {
    if (!lanes.has(lane)) fail(`Missing expansion lane: ${lane}`);
  }

  const grief = (data.expansion_lanes || []).find((lane) => lane.lane_id === "grief_held");
  if (!grief || grief.public_status !== "held") {
    fail("grief_held lane must remain held.");
  }

  for (const lane of data.expansion_lanes || []) {
    for (const key of [
      "lane_id",
      "priority",
      "purpose",
      "source_strategy",
      "public_risk",
      "review_requirement",
      "target_record_count_first_pass"
    ]) {
      if (!(key in lane)) fail(`${lane.lane_id || "(missing lane id)"} missing ${key}`);
    }
  }
}

if (failed) {
  console.error("GPMC SENSORY EXPANSION QUEUE AUDIT: FAIL");
  process.exit(1);
}

console.log("GPMC SENSORY EXPANSION QUEUE AUDIT: PASS");
