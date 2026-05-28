import fs from "node:fs";

const source = "staging/mothers-day/thank-you/audio-proof/thank-you-kk-structure.json";

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

  // ONLY standalone Br/Bridge should block thank-you-sec-br.
  // Larger contiguous KKs that include Br, like KK10 V2b through Outro,
  // are valid separate KK objects and must not be mistaken for the standalone Br artifact.
  const isStandaloneBr =
    normalizedTitle === "br" ||
    (normalizedIncludes.length === 1 && normalizedIncludes[0] === "br");

  if (isStandaloneBr && kk.status === "STRUCTURE_DEFINED_AUDIO_NOT_PROVEN") {
    blockers.push({
      kk_id: kk.kk_id,
      title,
      canonical: "Br",
      status: kk.status,
      required_output: "public/mothers-day/thank-you/kks-expanded/thank-you-sec-br.mp3"
    });
  }
}

if (blockers.length) {
  console.error("KKr STAGING AUDIO PROOF AUDIT: FAIL");
  for (const b of blockers) {
    console.error(`- ${b.kk_id} / ${b.title} normalizes to ${b.canonical}, but audio is not proven.`);
    console.error(`  Required controlled export: ${b.required_output}`);
  }
  process.exit(1);
}

console.log("KKr STAGING AUDIO PROOF AUDIT: PASS");
