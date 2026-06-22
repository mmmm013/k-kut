import fs from "node:fs";
import path from "node:path";

const file = "data/theme-population/normalized/gratitude-thank-you.normalized.json";
const data = JSON.parse(fs.readFileSync(file, "utf8"));

const failures = [];

console.log("# GRATITUDE / THANK YOU NORMALIZATION AUDIO AUDIT");
console.log("");
console.log(`theme: ${data.theme}`);
console.log(`pix_handle: ${data.pix.pix_handle}`);
console.log(`records: ${data.section_records.length}`);
console.log("");

for (const record of data.section_records) {
  const publicPath = record.audio_url;
  const localPath = path.join("public", publicPath.replace(/^\//, ""));
  const exists = fs.existsSync(localPath);
  const size = exists ? fs.statSync(localPath).size : 0;

  console.log(`## ${record.kk_id}`);
  console.log(`legacy_id: ${record.legacy_id}`);
  console.log(`section_id: ${record.section_id}`);
  console.log(`role: ${record.structural_role}`);
  console.log(`audio_url: ${publicPath}`);
  console.log(`local_path: ${localPath}`);
  console.log(`exists: ${exists}`);
  console.log(`size_bytes: ${size}`);
  console.log("");

  if (!exists) failures.push(`${record.kk_id}: missing ${localPath}`);
  if (exists && size < 1000) failures.push(`${record.kk_id}: suspicious small file ${localPath}`);
}

console.log("# SUMMARY");
console.log(`failures: ${failures.length}`);

if (failures.length) {
  for (const failure of failures) console.log(`- ${failure}`);
  process.exitCode = 2;
} else {
  console.log("AUDIT PASS");
}
