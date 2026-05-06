import fs from "node:fs";

const home = fs.readFileSync("app/page.tsx", "utf8");
const failures = [];

function check(name, ok) {
  console.log(`${ok ? "PASS" : "FAIL"} - ${name}`);
  if (!ok) failures.push(name);
}

console.log("\nK-KUT SONG CHOICE DEPTH AUDIT");
console.log("=============================\n");

check("Hard Feelings shared song set exists", home.includes("const HARD_FEELINGS_SONGS"));
check("Hard Feelings includes Hurt Like This", home.includes("SONGS.hurtLikeThis"));
check("Hard Feelings includes Changed Your Mind", home.includes("SONGS.changedYourMind"));
check("Hard Feelings includes Time Keeps On Movin", home.includes("SONGS.timeKeeps"));
check("Pain / Change uses multi-song set", home.includes('id: "pain-change"') && home.includes("songs: HARD_FEELINGS_SONGS"));
check("No Pain / Change one-song collapse", !home.includes('id: "pain-change"') || !home.includes('songs: [SONGS.hurtLikeThis]'));

console.log("\nSUMMARY");
console.log("=======");
console.log(`Fail: ${failures.length}`);

if (failures.length) process.exit(1);
