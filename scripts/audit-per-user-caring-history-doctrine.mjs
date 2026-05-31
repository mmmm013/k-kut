import fs from "node:fs";

const doctrinePath = "data/gpmc-sensory/per-user-caring-history-doctrine.json";

let failed = false;

function fail(message) {
  console.error("FAIL:", message);
  failed = true;
}

console.log("PER-USER CARING HISTORY DOCTRINE AUDIT");

if (!fs.existsSync(doctrinePath)) {
  fail(`Missing ${doctrinePath}`);
} else {
  const raw = fs.readFileSync(doctrinePath, "utf8");
  const data = JSON.parse(raw);

  for (const phrase of [
    "Remember to care better. Never remember to manipulate.",
    "User history must be opt-in.",
    "The user must be able to delete stored history.",
    "Do not surprise the user with remembered details in buyer-facing copy.",
    "Sensitive emotional notes must never be required for purchase.",
    "Nothing is assumed about the receiver."
  ]) {
    if (!raw.includes(phrase)) fail(`Missing required phrase: ${phrase}`);
  }

  for (const forbidden of [
    "vulnerability score",
    "manipulation prediction",
    "secret receiver profiling",
    "diagnosed mental health state"
  ]) {
    if (!raw.includes(forbidden)) fail(`Missing forbidden-memory guard: ${forbidden}`);
  }

  for (const key of [
    "consent_status",
    "relationship_lane",
    "occasion_or_situation",
    "selected_public_option_id",
    "sensory_preferences",
    "worked_well_notes",
    "avoid_next_time",
    "receiver_safe_words_used",
    "do_not_say",
    "review_status"
  ]) {
    if (!(key in data.history_record_shape)) {
      fail(`Missing history record field: ${key}`);
    }
  }

  for (const axis of ["audio", "body", "visual", "touch", "memory"]) {
    if (!(axis in data.history_record_shape.sensory_preferences)) {
      fail(`Missing sensory preference axis: ${axis}`);
    }
  }
}

if (failed) {
  console.error("PER-USER CARING HISTORY DOCTRINE AUDIT: FAIL");
  process.exit(1);
}

console.log("PER-USER CARING HISTORY DOCTRINE AUDIT: PASS");
