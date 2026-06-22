import fs from "node:fs";

const file = "data/theme-population/all-theme-population.seed.json";

const data = JSON.parse(fs.readFileSync(file, "utf8"));

const failures = [];

console.log("# K-KUT ALL THEME POPULATION AUDIT");
console.log("");
console.log(`Status: ${data.status}`);
console.log(`Themes: ${data.themes.length}`);
console.log("");

for (const theme of data.themes) {
  const candidateCount = theme.candidate_lt_pix?.length ?? 0;
  const kkCount = theme.candidate_kk_ids?.length ?? 0;
  const pixHandleCount = theme.pix_handles?.length ?? 0;

  console.log(`## ${theme.theme}`);
  console.log(`buyer_label: ${theme.buyer_label}`);
  console.log(`level: ${theme.level}`);
  console.log(`public_status: ${theme.public_status}`);
  console.log(`candidate_lt_pix_count: ${candidateCount}`);
  console.log(`pix_handle_count: ${pixHandleCount}`);
  console.log(`candidate_kk_count: ${kkCount}`);
  console.log(`next: ${theme.next_refinement_action}`);
  console.log("");

  if (!theme.theme) failures.push("Missing theme");
  if (!theme.buyer_label) failures.push(`${theme.theme}: missing buyer_label`);
  if (!theme.level) failures.push(`${theme.theme}: missing level`);
  if (!theme.public_status) failures.push(`${theme.theme}: missing public_status`);
  if (!theme.next_refinement_action) failures.push(`${theme.theme}: missing next_refinement_action`);
  if (!theme.full_pix_context_path) failures.push(`${theme.theme}: missing full_pix_context_path`);
}

const publicReady = data.themes.filter((theme) =>
  String(theme.level).includes("L3") || String(theme.level).includes("L4")
);

const needsCandidates = data.themes.filter((theme) =>
  (theme.candidate_lt_pix?.length ?? 0) === 0
);

console.log("# SUMMARY");
console.log(`public_ready_or_near_ready: ${publicReady.map((t) => t.theme).join(", ") || "none"}`);
console.log(`needs_lt_pix_candidates: ${needsCandidates.map((t) => t.theme).join(", ") || "none"}`);
console.log(`failures: ${failures.length}`);

if (failures.length) {
  console.log("");
  console.log("# FAILURES");
  for (const failure of failures) console.log(`- ${failure}`);
  process.exitCode = 2;
} else {
  console.log("AUDIT PASS");
}
