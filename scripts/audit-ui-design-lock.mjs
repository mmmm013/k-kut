import fs from "node:fs";

const failures = [];

function check(name, ok) {
  console.log(`${ok ? "PASS" : "FAIL"} - ${name}`);
  if (!ok) failures.push(name);
}

const path = "docs/gpmx-rules/UI_DESIGN_LOCK.md";
const doc = fs.existsSync(path) ? fs.readFileSync(path, "utf8") : "";

console.log("\nUI DESIGN LOCK AUDIT");
console.log("====================\n");

check("UI design lock doc exists", fs.existsSync(path));
check("Doc says current design is approved and locked", doc.includes("approved and locked"));
check("Doc blocks UI changes without owner consent", doc.includes("without explicit owner consent"));
check("Doc allows internal non-visual work", doc.includes("metadata refinement") && doc.includes("audit scripts"));
check("Doc blocks visual layout changes", doc.includes("visual layout changes"));
check("Doc preserves Mother’s Day KK-only rule", doc.includes("Mother’s Day public offer is KK-only"));
check("Doc pauses LineFeels", doc.includes("LineFeels / CC assets are paused"));
check("Doc preserves MC-BOT / GP-BOT rule", doc.includes("MC-BOT leads") && doc.includes("GP-BOT is reserved"));
check("Doc blocks downloads", doc.includes("No downloads"));
check("Doc blocks SMS until approved", doc.includes("No SMS sending until approved"));

console.log("\nSUMMARY");
console.log("=======");
console.log(`Fail: ${failures.length}`);

if (failures.length) {
  console.log("\nFAILURES");
  console.log("========");
  failures.forEach((failure) => console.log(`FAIL - ${failure}`));
  process.exit(1);
}
