import fs from "node:fs";

const manifestPath = "public/hug-delivery/thank-you/ii-delivery-manifest.json";

if (!fs.existsSync(manifestPath)) {
  console.error(`FAIL: missing II delivery manifest ${manifestPath}`);
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const rows = manifest.rows || [];

let failed = false;

for (const row of rows) {
  const file = "public/" + String(row.ii_delivery_src || "").replace(/^\//, "");

  if (!fs.existsSync(file)) {
    console.error(`FAIL: missing II delivery audio for ${row.id}: ${file}`);
    failed = true;
  }

  if (!row.front_bookend_seconds || row.front_bookend_seconds <= 0) {
    console.error(`FAIL: missing front bookend for ${row.id}`);
    failed = true;
  }

  if (!row.back_bookend_seconds || row.back_bookend_seconds <= 0) {
    console.error(`FAIL: missing back bookend for ${row.id}`);
    failed = true;
  }

  if (!row.signature_end_sound_name || !String(row.signature_end_sound_name).toLowerCase().includes("twinkle")) {
    console.error(`FAIL: missing Signature End Sound / Twinkle marker for ${row.id}`);
    failed = true;
  }
}

if (failed) {
  console.error("\nII DELIVERY BOOKEND TWINKLE AUDIT: FAIL");
  process.exit(1);
}

console.log(`II DELIVERY BOOKEND TWINKLE AUDIT: PASS — ${rows.length} delivery files checked.`);
