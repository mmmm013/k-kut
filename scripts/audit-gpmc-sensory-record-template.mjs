import fs from "node:fs";

const templatePath = "data/gpmc-sensory/sensory-emotional-record-template.json";

let failed = false;

function fail(message) {
  console.error("FAIL:", message);
  failed = true;
}

console.log("GPMC SENSORY RECORD TEMPLATE AUDIT");

if (!fs.existsSync(templatePath)) {
  fail(`Missing ${templatePath}`);
} else {
  const raw = fs.readFileSync(templatePath, "utf8");
  const data = JSON.parse(raw);

  for (const phrase of [
    "Slice as thinly as the emotional meaning remains complete.",
    "Do not slice thinner than human meaning.",
    "Do not exploit vulnerability.",
    "Do not diagnose the buyer or receiver.",
    "Do not sell emotion as a commodity.",
    "good_use_cases",
    "bad_use_cases",
    "risk_notes",
    "receiver_safe_words",
    "do_not_say",
    "approved_public"
  ]) {
    if (!raw.includes(phrase)) fail(`Missing required phrase: ${phrase}`);
  }

  const requiredTop = [
    "record_id",
    "source_pix_id_or_track_id",
    "source_title",
    "source_type",
    "surface_feeling",
    "deeper_feelings",
    "sensory_profile",
    "emotional_coordinates",
    "good_use_cases",
    "bad_use_cases",
    "risk_notes",
    "buyer_words",
    "receiver_safe_words",
    "do_not_say",
    "review_status"
  ];

  for (const key of requiredTop) {
    if (!(key in data.required_fields)) {
      fail(`Missing required field definition: ${key}`);
    }
  }

  for (const axis of ["audio", "body", "visual", "touch", "memory"]) {
    if (!(axis in data.required_fields.sensory_profile)) {
      fail(`Missing sensory axis in required fields: ${axis}`);
    }
    if (!(axis in data.example_record.sensory_profile)) {
      fail(`Missing sensory axis in example record: ${axis}`);
    }
  }

  for (const coord of [
    "valence",
    "arousal",
    "control_or_agency",
    "social_direction",
    "time_direction"
  ]) {
    if (!(coord in data.required_fields.emotional_coordinates)) {
      fail(`Missing emotional coordinate in required fields: ${coord}`);
    }
    if (!(coord in data.example_record.emotional_coordinates)) {
      fail(`Missing emotional coordinate in example record: ${coord}`);
    }
  }

  if (data.example_record.review_status !== "approved_public") {
    fail("Example record must be approved_public.");
  }

  if (!Array.isArray(data.example_record.good_use_cases) || data.example_record.good_use_cases.length < 2) {
    fail("Example record needs multiple good_use_cases.");
  }

  if (!Array.isArray(data.example_record.bad_use_cases) || data.example_record.bad_use_cases.length < 2) {
    fail("Example record needs multiple bad_use_cases.");
  }

  if (!Array.isArray(data.example_record.risk_notes) || data.example_record.risk_notes.length < 1) {
    fail("Example record needs risk_notes.");
  }
}

if (failed) {
  console.error("GPMC SENSORY RECORD TEMPLATE AUDIT: FAIL");
  process.exit(1);
}

console.log("GPMC SENSORY RECORD TEMPLATE AUDIT: PASS");
