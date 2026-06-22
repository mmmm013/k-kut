import fs from "node:fs";

const source = "staging/mothers-day/thank-you/audio-proof/thank-you-kk-structure.json";
const finalBr = "public/kks/thank-you/kks-expanded/thank-you-sec-br.mp3";

if (!fs.existsSync(source)) {
  console.error(`FAIL: missing staging structure source ${source}`);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(source, "utf8"));
const blockers = [];

function norm(value) {
  const s = String(value || "").trim().toLowerCase();
  if (s === "bridge" || s === "br") return "br";
  return s;
}

for (const kk of data.kk_set || []) {
  const title = String(kk.title || "");
  const includes = Array.isArray(kk.includes) ? kk.includes.map(String) : [];

  const normalizedTitle = norm(title);
  const normalizedIncludes = includes.map(norm);

  const isStandaloneBr =
    normalizedTitle === "br" ||
    (normalizedIncludes.length === 1 && normalizedIncludes[0] === "br");

  if (isStandaloneBr && kk.status === "STRUCTURE_DEFINED_AUDIO_NOT_PROVEN") {
    if (!fs.existsSync(finalBr)) {
      blockers.push({
        kk_id: kk.kk_id,
        title,
        canonical: "Br",
        status: kk.status,
        required_output: finalBr
      });
    }
  }
}

if (blockers.length) {
  console.error("KKr STAGING AUDIO PROOF AUDIT: FAIL");
  for (const b of blockers) {
    console.error(`- ${b.kk_id} / ${b.title} normalizes to ${b.canonical}, but final delivery audio is missing.`);
    console.error(`  Required controlled export: ${b.required_output}`);
  }
  process.exit(1);
}

console.log("KKr STAGING AUDIO PROOF AUDIT: PASS");
