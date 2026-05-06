import fs from "node:fs";
import path from "node:path";

const manifestPath = "public/audio/kleigh/guide-final/manifest.json";
const expectedUnique = 34;
const failures = [];

function check(name, ok) {
  console.log(`${ok ? "PASS" : "FAIL"} - ${name}`);
  if (!ok) failures.push(name);
}

console.log("\nKLEIGH FINAL GUIDE ASSET AUDIT");
console.log("==============================\n");

check("Manifest exists", fs.existsSync(manifestPath));

let manifest = null;
if (fs.existsSync(manifestPath)) {
  manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
}

check("Artist is KLEIGH", manifest?.artist === "KLEIGH");
check("Set is guide-final", manifest?.set === "guide-final");
check("Captured total is 37", manifest?.total_captured === 37);
check("Unique recording count is 34", manifest?.unique_recordings === expectedUnique);
check("Duplicate copies removed is 3", manifest?.duplicate_copies_removed === 3);
check("Manifest has 34 items", Array.isArray(manifest?.items) && manifest.items.length === expectedUnique);

const files = fs.existsSync("public/audio/kleigh/guide-final")
  ? fs.readdirSync("public/audio/kleigh/guide-final").filter((name) => name.toLowerCase().endsWith(".m4a"))
  : [];

check("Public folder has 34 m4a files", files.length === expectedUnique);

if (manifest?.items) {
  for (const item of manifest.items) {
    const filePath = item.file?.startsWith("/")
      ? path.join("public", item.file)
      : null;

    check(`Asset exists: ${item.id}`, Boolean(filePath && fs.existsSync(filePath)));

    if (filePath && fs.existsSync(filePath)) {
      const size = fs.statSync(filePath).size;
      check(`Asset non-empty: ${item.id}`, size > 1000);
    }
  }
}

console.log("\nSUMMARY");
console.log("=======");
console.log(`Fail: ${failures.length}`);

if (failures.length) process.exit(1);
