import fs from "node:fs";

const home = fs.readFileSync("app/page.tsx", "utf8");
const failures = [];

function check(name, ok) {
  console.log(`${ok ? "PASS" : "FAIL"} - ${name}`);
  if (!ok) failures.push(name);
}

console.log("\nK-KUT OPTIONS AUDIT");
console.log("===================\n");

check("Minimum KK option rule is 10", home.includes("const MIN_KK_OPTIONS = 10;"));
check("Homepage builds KK options dynamically", home.includes("function buildKKOptions(song: Song)"));
check("Homepage uses kkOptions for display", home.includes("kkOptions.map((item, index)"));
check("Homepage confirms from kkOptions", home.includes("kkOptions.find((item) => item.id === kkId)"));
check("Homepage tells user there are at least 10 options", home.includes("at least 10 K-KUT options"));
check("Homepage avoids false category coming-soon dead end", !home.includes("This one is coming soon. Try Mother"));
check("Homepage still has Play option", home.includes("Play option"));
check("Homepage still has Choose this HUG", home.includes("Choose this HUG"));

console.log("\nSUMMARY");
console.log("=======");
console.log(`Fail: ${failures.length}`);

if (failures.length) process.exit(1);
