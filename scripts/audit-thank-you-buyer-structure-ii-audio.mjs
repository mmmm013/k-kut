import fs from "node:fs";

const pagePath = "app/mothers-day/thank-you/page.tsx";
const manifestPath = "public/hug-delivery/thank-you/ii-delivery-manifest.json";

let failed = false;

function fail(msg) {
  console.error("FAIL:", msg);
  failed = true;
}

console.log("THANK YOU BUYER STRUCTURE II AUDIO AUDIT");

const page = fs.readFileSync(pagePath, "utf8");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const rows = manifest.rows || [];

for (const row of rows) {
  const raw = row.raw_preview_src;
  const ii = row.ii_delivery_src;

  if (page.includes(raw)) {
    fail(`Buyer-facing page still uses raw locked structure audio for ${row.id}: ${raw}`);
  }

  const file = "public/" + String(ii || "").replace(/^\//, "");
  if (!fs.existsSync(file)) {
    fail(`Finished II delivery file missing for ${row.id}: ${file}`);
  }
}

const requiredAtLeastOne = rows.some((row) => page.includes(row.ii_delivery_src));
if (!requiredAtLeastOne) {
  fail("Buyer-facing Thank You page does not use any finished II delivery URLs.");
}

console.log(`Checked ${rows.length} locked Thank You II delivery row(s).`);

if (failed) {
  console.error("THANK YOU BUYER STRUCTURE II AUDIO AUDIT: FAIL");
  process.exit(1);
}

console.log("THANK YOU BUYER STRUCTURE II AUDIO AUDIT: PASS");
