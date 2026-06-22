import fs from "fs";
import path from "path";

const ROOT = process.cwd();

const CANONICAL_ID = "gpmx-canonical-twinkle";
const ATTACH_POINT = "artTailEnd";

const activeProductManifestFiles = [
  "data/kk-sets/fathers-day-product-statements.json",
  "data/kk-sets/fathers-day-statements-twinkle-overlap-v2.json"
];

const productAudioKeys = new Set([
  "audioUrl",
  "publicAudioUrl",
  "audioPath",
  "deliveryAudioUrl",
  "dispatchAudioUrl",
  "dpAudioUrl",
  "localReviewFile"
]);

const forbiddenFinalAudioFragments = [
  "/_work/",
  "/staging/",
  "/review/",
  "/proof/",
  "/raw/",
  "/source-audio/",
  "/source_audio/",
  "review-kks",
  "tp-review",
  "tpr"
];

function isProductAudio(value) {
  if (typeof value !== "string") return false;
  return value.startsWith("/kks/") || value.startsWith("public/kks/");
}

function isForbiddenFinalAudio(value) {
  if (typeof value !== "string") return false;
  const v = value.toLowerCase();
  return forbiddenFinalAudioFragments.some((frag) => v.includes(frag));
}

function inspectObject(obj, file, pointer, failures) {
  if (!obj || typeof obj !== "object") return;

  if (Array.isArray(obj)) {
    obj.forEach((v, i) => inspectObject(v, file, `${pointer}[${i}]`, failures));
    return;
  }

  for (const [k, v] of Object.entries(obj)) {
    if (productAudioKeys.has(k) && typeof v === "string") {
      if (isForbiddenFinalAudio(v)) {
        failures.push(`${file} ${pointer}.${k}: active product/DP/Dispatch audio references protected naked lane: ${v}`);
      }

      if (isProductAudio(v)) {
        if (obj.canonicalTwinkleId !== CANONICAL_ID) {
          failures.push(`${file} ${pointer}: missing canonicalTwinkleId "${CANONICAL_ID}" for active product audio ${v}`);
        }
        if (obj.twinkleRequired !== true) {
          failures.push(`${file} ${pointer}: missing twinkleRequired: true for active product audio ${v}`);
        }
        if (obj.twinkleApplied !== true) {
          failures.push(`${file} ${pointer}: missing twinkleApplied: true for active product audio ${v}`);
        }
        if (obj.twinkleAttachPoint !== ATTACH_POINT) {
          failures.push(`${file} ${pointer}: missing twinkleAttachPoint "${ATTACH_POINT}" for active product audio ${v}`);
        }
      }
    }

    inspectObject(v, file, `${pointer}.${k}`, failures);
  }
}

const failures = [];

for (const rel of activeProductManifestFiles) {
  const file = path.join(ROOT, rel);

  if (!fs.existsSync(file)) {
    failures.push(`${rel}: active product manifest missing`);
    continue;
  }

  let data;
  try {
    data = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (err) {
    failures.push(`${rel}: invalid JSON: ${err.message}`);
    continue;
  }

  inspectObject(data, rel, "$", failures);
}

if (failures.length) {
  console.error("GPMx Twinkle Product Inventory / Art-Tail Audit FAIL");
  console.error("");
  console.error("Active product-bound audio must use the one canonical Twinkle at the art-tail end.");
  console.error("Raw/source/review lanes remain protected and unforced.");
  console.error("");
  for (const f of failures) console.error(" - " + f);
  process.exit(1);
}

console.log("GPMx Twinkle Product Inventory / Art-Tail Audit PASS");
console.log("Active product-bound II/CI/KK/K-KOMBO/DP/Dispatch audio records carry canonical Twinkle metadata and avoid naked review/source lanes.");
