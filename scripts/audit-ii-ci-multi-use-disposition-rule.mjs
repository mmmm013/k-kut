import fs from "node:fs";

const failures = [];

function check(name, ok) {
  console.log(`${ok ? "PASS" : "FAIL"} - ${name}`);
  if (!ok) failures.push(name);
}

const path = "docs/gpmx-rules/II_CI_MULTI_USE_DISPOSITION_RULE.md";
const doc = fs.readFileSync(path, "utf8");

console.log("\nII/CI MULTI-USE DISPOSITION RULE AUDIT");
console.log("======================================\n");

check("Rule doc exists", fs.existsSync(path));
check("Rule allows unlimited appearances", doc.includes("unlimited search results"));
check("Rule defines repeated appearance not duplication", doc.includes("not duplication"));
check("Rule defines Asset", doc.includes("Asset ="));
check("Rule defines Use Case", doc.includes("Use Case ="));
check("Rule defines Search Result", doc.includes("Search Result ="));
check("Rule defines Disposition", doc.includes("Disposition ="));
check("Rule includes APPROVE_PRIMARY", doc.includes("APPROVE_PRIMARY"));
check("Rule includes APPROVE_SECONDARY", doc.includes("APPROVE_SECONDARY"));
check("Rule includes REJECT_FOR_THIS_USE", doc.includes("REJECT_FOR_THIS_USE"));
check("Rule preserves no-download control", doc.includes("never authorizes raw audio download"));
check("Rule requires separate disposition per lane", doc.includes("each lane must have its own disposition"));

console.log("\nSUMMARY");
console.log("=======");
console.log(`Fail: ${failures.length}`);

if (failures.length) {
  console.log("\nFAILURES");
  console.log("========");
  failures.forEach((failure) => console.log(`FAIL - ${failure}`));
  process.exit(1);
}
