import fs from "node:fs";

const p = "data/system-map/kkr-dup-level-xml-armed-doctrine.json";

let failed = false;

function fail(message) {
  console.error("FAIL:", message);
  failed = true;
}

console.log("KKR DUP LEVEL XML-ARMED DOCTRINE AUDIT");

if (!fs.existsSync(p)) {
  fail(`Missing ${p}`);
} else {
  const raw = fs.readFileSync(p, "utf8");
  const data = JSON.parse(raw);

  for (const phrase of [
    "DUPs are allowed",
    "best reviewed candidate wins",
    "If two same-level candidates tie, no forced change is required.",
    "emotional levels",
    "Do not collapse meaningful emotional levels into a single flat tag.",
    "XML readiness does not equal public approval.",
    "Do not let XML-ready records bypass human review.",
    "Do not let mKs enter current K-KUT buyer flow through this doctrine."
  ]) {
    if (!raw.includes(phrase)) fail(`Missing required phrase: ${phrase}`);
  }

  for (const key of [
    "A_best_one_wins_when_same",
    "B_if_tie_no_change",
    "C_emotional_levels_convene"
  ]) {
    if (!(key in data.dup_rules)) fail(`Missing DUP rule: ${key}`);
  }

  for (const field of [
    "record_id",
    "source_id",
    "candidate_type",
    "lane_id",
    "surface_feeling",
    "deeper_feelings",
    "emotional_level",
    "sensory_profile",
    "good_use_cases",
    "bad_use_cases",
    "risk_notes",
    "review_status",
    "public_status",
    "audio_delivery_url",
    "do_not_say"
  ]) {
    if (!data.xml_armed_requirement.required_xml_fields.includes(field)) {
      fail(`Missing XML-armed field: ${field}`);
    }
  }
}

if (failed) {
  console.error("KKR DUP LEVEL XML-ARMED DOCTRINE AUDIT: FAIL");
  process.exit(1);
}

console.log("KKR DUP LEVEL XML-ARMED DOCTRINE AUDIT: PASS");
