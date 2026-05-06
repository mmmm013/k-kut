import fs from "node:fs";

const home = fs.readFileSync("app/page.tsx", "utf8");
const failures = [];

function check(name, ok) {
  console.log(`${ok ? "PASS" : "FAIL"} - ${name}`);
  if (!ok) failures.push(name);
}

console.log("\nK-KUT SONG BATCH AUDIT");
console.log("======================\n");

check("Song batch size is 6", home.includes("const SONG_BATCH_SIZE = 6;"));
check("Song screen uses visibleSongs", home.includes("visibleSongs.map((item)"));
check("Song batching has another-set option", home.includes("Show me another set"));
check("Song screen avoids filler message", home.includes("We only show songs that fit this choice."));
check("Hard Feelings does not use Time Keeps shortcut", !home.includes("HARD_FEELINGS_SONGS"));
check("Pain / Change excludes Time Keeps On Movin", !home.includes('id: "pain-change"') || !home.includes("songs: HARD_FEELINGS_SONGS"));
check("Time Keeps remains available for Comfort", home.includes('id: "comfort"') && home.includes("SONGS.timeKeeps"));

console.log("\nSUMMARY");
console.log("=======");
console.log(`Fail: ${failures.length}`);

if (failures.length) process.exit(1);
