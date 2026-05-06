import fs from "node:fs";

const home = fs.readFileSync("app/page.tsx", "utf8");
const failures = [];

function check(name, ok) {
  console.log(`${ok ? "PASS" : "FAIL"} - ${name}`);
  if (!ok) failures.push(name);
}

console.log("\nK-KUT HARD FEELINGS LANE AUDIT");
console.log("==============================\n");

check("Hard Feelings has Sorry lane", home.includes('id: "sorry"') && home.includes('title: "Sorry"'));
check("Hard Feelings has Reflection lane", home.includes('id: "reflection"') && home.includes('title: "Reflection"'));
check("Hard Feelings has Hurt lane", home.includes('id: "hurt"') && home.includes('title: "Hurt"'));
check("Hard Feelings has Cry lane", home.includes('id: "cry"') && home.includes('title: "Cry"'));
check("Hard Feelings has Sorrow / Break Up lane", home.includes('id: "sorrow-break-up"') && home.includes('title: "Sorrow / Break Up"'));

check("Hurt lane includes Hurt Like This", home.includes("SONGS.hurtLikeThis"));
check("Hurt lane includes Changed Your Mind", home.includes("SONGS.changedYourMind"));
check("Hurt lane includes Cry", home.includes("SONGS.cry"));
check("Hurt lane includes Sorrow / Break Up", home.includes("SONGS.sorrowBreakUp"));
check("Hurt lane excludes Time Keeps On Movin", !home.includes('id: "hurt"') || !home.includes("SONGS.timeKeeps"));

check("Hard Feelings type screen is user-friendly", home.includes("Choose the kind of hard feeling."));

console.log("\nSUMMARY");
console.log("=======");
console.log(`Fail: ${failures.length}`);

if (failures.length) process.exit(1);
