const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const dataPath = path.join(ROOT, "data/fathers-day/ci/fathers-day-page-v001.json");
const dropbox = path.join(ROOT, "public/fathers-day-cis/dropbox");

const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));

const map = {
  "you-earned-this": "you-earned-this.mp3",
  "keep-going-dad": "keep-going-dad.mp3",
  "strong-quiet-dad": "strong-quiet-dad.mp3",
  "family-first-dad": "family-first-dad.mp3",
  "work-boots-dad": "work-boots-dad.mp3",
  "western-dad": "western-dad.mp3"
};

let attached = 0;

for (const ci of data.cis) {
  const filename = map[ci.id];
  if (!filename) continue;

  const abs = path.join(dropbox, filename);
  if (fs.existsSync(abs)) {
    ci.audio_path = `/fathers-day-cis/dropbox/${filename}`;
    ci.status = "AUDIO_ATTACHED";
    attached++;
  } else {
    ci.status = ci.audio_path ? "AUDIO_ATTACHED" : "WAITING_FOR_AUDIO";
  }
}

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

console.log("DROPBOX FATHER'S DAY CI ATTACH COMPLETE");
console.log("attached_count:", attached);
for (const ci of data.cis) {
  console.log(`${ci.id}: ${ci.audio_path || "NO AUDIO"} — ${ci.status}`);
}
