import fs from "node:fs";
import path from "node:path";

const dir = path.join(process.cwd(), "public/mothers-day/thank-you/kks-expanded");
const out = path.join(process.cwd(), "data/kkr/audio-inventory/thank-you-kks-inventory.json");

function groupFor(filename) {
  if (filename.startsWith("thank-you-cc-")) return "cc";
  if (filename.startsWith("thank-you-kk")) return "legacy_kk";
  if (filename.startsWith("thank-you-sec-")) return "structure_section";
  return "unknown";
}

const files = fs
  .readdirSync(dir)
  .filter((file) => file.endsWith(".mp3"))
  .sort()
  .map((file) => {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);

    return {
      id: file.replace(/\.mp3$/, ""),
      filename: file,
      group: groupFor(file),
      repo_path: `public/mothers-day/thank-you/kks-expanded/${file}`,
      public_url: `/mothers-day/thank-you/kks-expanded/${file}`,
      size_bytes: stat.size,
      canonical_audio_home: true,
      apple_music_is_home: false,
      human_meaning_status: "unreviewed"
    };
  });

const group_counts = files.reduce((acc, file) => {
  acc[file.group] = (acc[file.group] || 0) + 1;
  return acc;
}, {});

const report = {
  system: "K-KUT KK Audio Inventory",
  source_family: "thank-you",
  rule: "Repo public path is canonical for public playback. Apple Music is a listening/import workspace only.",
  canonical_directory: "public/mothers-day/thank-you/kks-expanded",
  count: files.length,
  group_counts,
  files
};

fs.writeFileSync(out, JSON.stringify(report, null, 2));
console.log(`WROTE ${out}`);
console.log(`COUNT ${files.length}`);
console.log(JSON.stringify(group_counts, null, 2));
