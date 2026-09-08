#!/usr/bin/env node
import fs from "node:fs";

const lawPath = "data/kkr/reprosecution/lt-pix-authority-join-law-v1.json";
const runnerPath = "scripts/kkr/run-lt-pix-authority-join-read-only-v1.mjs";
const law = JSON.parse(fs.readFileSync(lawPath, "utf8"));
const runner = fs.readFileSync(runnerPath, "utf8");

const checks = [
  [law.status === "LOCKED_READ_ONLY_PROSECUTION", "read-only prosecution locked"],
  [law.laws.lyrics_required_for_every_vocal_lt_pix === true, "full lyrics required"],
  [law.laws.legacy_song_section_labels_are_not_cutting_authority === true, "legacy section labels demoted"],
  [law.laws.never_cut_a_vtp === true, "never cut a VTP"],
  [law.laws.never_infer_one_blk_end_from_next_blk_start === true, "BLK end not inferred"],
  [law.laws.source_unavailable_in_session_is_triage_not_missing === true, "session absence is TRIAGE"],
  [law.laws.blocked_missing_authority_requires_explicit_exhaustive_absence_proof === true, "BLOCKED requires proof"],
  [law.laws.audio_mutation_allowed === false, "audio mutation blocked"],
  [law.laws.database_write_allowed === false, "database write blocked"],
  [law.laws.deployment_allowed === false, "deployment blocked"],
  [runner.includes('"TRIAGE_SESSION_ACCESS_REQUIRED"'), "runner preserves session triage"],
  [runner.includes('"BLOCKED_MISSING_AUTHORITY"'), "runner supports proved missing authority"],
  [runner.includes("authority_absent_confirmed === true"), "runner requires explicit absence confirmation"],
  [runner.includes("authority_absence_search_receipt"), "runner requires absence receipt"],
  [runner.includes("source_audio_mutations: 0"), "runner records zero audio mutation"],
  [runner.includes("catalog_completion_claimed: false"), "runner makes no false completion claim"]
];

let failed = 0;
for (const [ok, label] of checks) {
  console.log(`${ok ? "PASS" : "FAIL"}: ${label}`);
  if (!ok) failed++;
}
if (failed) process.exit(1);
console.log("LT-PIX AUTHORITY JOIN LAW: PASS");
