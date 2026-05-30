import fs from "node:fs";

const file = "data/fathers-day/no-mystery-kk-structure-standard.json";
let failed = false;

function fail(msg) {
  console.error("FAIL:", msg);
  failed = true;
}

function isContiguous(nums) {
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] !== nums[i - 1] + 1) return false;
  }
  return true;
}

console.log("NO MYSTERY KK STRUCTURE STANDARD AUDIT");

if (!fs.existsSync(file)) {
  fail(`Missing ${file}`);
} else {
  const data = JSON.parse(fs.readFileSync(file, "utf8"));

  const expectedLabels = [
    "Intro + V1",
    "Ch1",
    "V2",
    "Ch2",
    "Br",
    "Ch3 / Final Chorus",
    "Outro"
  ];

  const kks = data.lone_section_kks || [];
  const combos = data.approved_contiguous_kk_kombos || [];

  if (kks.length !== 7) fail(`Expected 7 lone-section KKs, found ${kks.length}`);

  for (let i = 0; i < expectedLabels.length; i++) {
    const kk = kks[i];
    if (!kk) continue;

    if (kk.kk_number !== i + 1) fail(`KK ${i + 1} has wrong kk_number: ${kk.kk_number}`);
    if (kk.label !== expectedLabels[i]) fail(`KK ${i + 1} expected ${expectedLabels[i]}, found ${kk.label}`);
    if (kk.type !== "lone_section_kk") fail(`${kk.label} must be lone_section_kk`);
  }

  const labels = kks.map((k) => k.label);
  if (!labels.includes("V2")) fail("V2 missing from No Mystery lone-section KKs");

  const requiredCombos = [
    "Intro + V1 + Ch1",
    "V2 + Ch2",
    "Br + Ch3 + Outro",
    "Br + Ch3",
    "Ch3 + Outro"
  ];

  const comboLabels = combos.map((c) => c.label);

  for (const label of requiredCombos) {
    if (!comboLabels.includes(label)) fail(`Missing approved contiguous KK-Kombo: ${label}`);
  }

  for (const combo of combos) {
    if (combo.type !== "contiguous_kk_kombo") fail(`${combo.label} must be contiguous_kk_kombo`);

    if (!Array.isArray(combo.kk_numbers) || combo.kk_numbers.length < 2) {
      fail(`${combo.label} must contain at least two KK numbers`);
      continue;
    }

    if (!isContiguous(combo.kk_numbers)) {
      fail(`${combo.label} violates contiguity law: ${combo.kk_numbers.join(",")}`);
    }
  }

  if (!String(data.kk_law?.combo_contiguity_law || "").includes("contiguous")) {
    fail("Missing combo contiguity law");
  }

  if (!String(data.delivery_law?.public_audio_rule || "").includes("AUDIO CAN NEVER LEAVE AN II")) {
    fail("Missing AUDIO CAN NEVER LEAVE AN II delivery law");
  }
}

if (failed) {
  console.error("NO MYSTERY KK STRUCTURE STANDARD AUDIT: FAIL");
  process.exit(1);
}

console.log("NO MYSTERY KK STRUCTURE STANDARD AUDIT: PASS");
