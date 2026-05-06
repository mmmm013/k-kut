import fs from "node:fs";

const failures = [];

function check(name, ok) {
  console.log(`${ok ? "PASS" : "FAIL"} - ${name}`);
  if (!ok) failures.push(name);
}

const home = fs.readFileSync("app/page.tsx", "utf8");

console.log("\nTEMP K-KUT HUG LANDING AUDIT");
console.log("============================\n");

check("Landing says K-KUT HUG", home.includes("K-KUT HUG"));
check("Landing says Send feeling through music", home.includes("Send feeling through music"));
check("Landing has audio greeting card language", home.includes("historic audio greeting card"));
check("Landing has Choose the feeling", home.includes("Choose the feeling"));
check("Landing has Find the fit", home.includes("Find the fit"));
check("Landing has Send the moment", home.includes("Send the moment"));
check("Landing has Start now CTA", home.includes("Start now"));
check("Landing points Start now to Mother’s Day HUG", home.includes('href="/hug/mothers-day"'));
check("Landing includes text DM social email sharing", home.includes("text, DM, social link, or email"));
check("Landing introduces HUGs and TUGs", home.includes("K-KUT HUGs &amp; TUGs"));
check("Landing does not claim automated SMS", !home.toLowerCase().includes("automated sms"));
check("Landing does not promise download", !home.toLowerCase().includes("download"));

console.log("\nSUMMARY");
console.log("=======");
console.log(`Fail: ${failures.length}`);

if (failures.length) {
  console.log("\nFAILURES");
  console.log("========");
  failures.forEach((failure) => console.log(`FAIL - ${failure}`));
  process.exit(1);
}
