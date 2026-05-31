import fs from "node:fs";

const doctrinePath = "data/system-map/gpmc-pix-sensory-emotional-doctrine.json";

let failed = false;

function fail(message) {
  console.error("FAIL:", message);
  failed = true;
}

console.log("GPMC PIX SENSORY-EMOTIONAL DOCTRINE AUDIT");

if (!fs.existsSync(doctrinePath)) {
  fail(`Missing ${doctrinePath}`);
} else {
  const raw = fs.readFileSync(doctrinePath, "utf8");
  const doctrine = JSON.parse(raw);

  for (const required of [
    "GPM PIX are human-made musical connection objects",
    "LOVE is the truest center and final measure",
    "Revenue is allowed. Harm is not.",
    "Do not exploit vulnerability.",
    "Do not diagnose the buyer or receiver.",
    "Slice as thinly as the emotional meaning remains complete.",
    "Do not slice thinner than human meaning.",
    "K-KUT does not sell emotion.",
    "what words alone may not"
  ]) {
    if (!raw.includes(required)) {
      fail(`Doctrine missing required phrase: ${required}`);
    }
  }

  for (const requiredAxis of ["audio", "body", "visual", "touch", "memory"]) {
    if (!doctrine.sensory_axes?.[requiredAxis]) {
      fail(`Missing sensory axis: ${requiredAxis}`);
    }
  }

  for (const requiredCoordinate of [
    "valence",
    "arousal",
    "control_or_agency",
    "social_direction",
    "time_direction"
  ]) {
    if (!doctrine.emotional_coordinates?.[requiredCoordinate]) {
      fail(`Missing emotional coordinate: ${requiredCoordinate}`);
    }
  }

  for (const forbidden of [
    "guaranteed emotional result",
    "we know exactly what they feel",
    "this will fix it"
  ]) {
    if (!raw.includes(forbidden)) {
      fail(`Buyer-language avoid list missing forbidden phrase: ${forbidden}`);
    }
  }
}

if (failed) {
  console.error("GPMC PIX SENSORY-EMOTIONAL DOCTRINE AUDIT: FAIL");
  process.exit(1);
}

console.log("GPMC PIX SENSORY-EMOTIONAL DOCTRINE AUDIT: PASS");
