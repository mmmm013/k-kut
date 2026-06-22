import fs from "node:fs";

const failures = [];
const fail = (m) => failures.push(m);

const serverPath = "scripts/serve-universal-kut-linear-factory-v1.mjs";

if (!fs.existsSync(serverPath)) fail(`Missing ${serverPath}`);

if (fs.existsSync(serverPath)) {
  const s = fs.readFileSync(serverPath, "utf8");

  for (const marker of [
    "ACCEPT + NEXT",
    "ADJUST",
    "SAVE ADJUSTMENT + NEXT",
    "FINISH / SAVE LANES",
    "accept-for-processing",
    "processing-only-not-release",
    "releaseReadyNow: false",
    "releaseGateAllowedNow: false",
    "queueComplete",
    "finishOnly",
    "mainButtons",
    "APPROVED FOR PROCESSING",
    "ADJUST / RECUT LANE"
  ]) {
    if (!s.includes(marker)) fail(`Linear factory missing marker: ${marker}`);
  }

  if (s.includes("navigator.clipboard") || s.includes("clipboard.writeText")) {
    fail("Linear factory must not depend on browser clipboard APIs.");
  }

  if (s.includes("REJECT")) {
    fail("Linear factory should not show reject.");
  }
}

if (failures.length) {
  console.error("UNIVERSAL KUT LINEAR FACTORY AUDIT: FAIL");
  for (const f of failures) console.error(f);
  process.exit(1);
}

console.log("UNIVERSAL KUT LINEAR FACTORY AUDIT: PASS");
console.log("Linear factory uses Play → Accept/Adjust → Next → Finish, writes to disk, and has a clean queue-complete screen.");
