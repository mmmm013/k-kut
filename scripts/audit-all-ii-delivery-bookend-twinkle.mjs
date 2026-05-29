import fs from "node:fs";
import path from "node:path";

const registryPaths = [
  "data/ii-delivery-registry/romance-reusable-ii-records.json"
];

function fail(message) {
  console.error("FAIL:", message);
  process.exit(1);
}

let checked = 0;

for (const registryPath of registryPaths) {
  if (!fs.existsSync(registryPath)) fail(`Missing registry: ${registryPath}`);

  const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));

  if (!registry.delivery_law?.twinkle_and_padding_travel_together) {
    fail(`${registryPath} missing delivery_law.twinkle_and_padding_travel_together`);
  }

  for (const record of registry.records || []) {
    checked++;

    if (record.delivery_status !== "delivery_audio_materialized_bookend_twinkle") {
      fail(`${record.ii_id} not materialized with bookend Twinkle.`);
    }

    if (!record.delivery_audio_url) {
      fail(`${record.ii_id} missing delivery_audio_url.`);
    }

    const localPath = path.join(process.cwd(), "public", record.delivery_audio_url.replace(/^\//, ""));
    if (!fs.existsSync(localPath)) {
      fail(`${record.ii_id} delivery file missing: ${localPath}`);
    }

    const m = record.delivery_materialization || {};

    if (!m.front_padding_seconds || m.front_padding_seconds <= 0) {
      fail(`${record.ii_id} missing front padding.`);
    }

    if (!m.back_padding_seconds || m.back_padding_seconds <= 0) {
      fail(`${record.ii_id} missing back padding.`);
    }

    if (!m.twinkle_path) {
      fail(`${record.ii_id} missing Twinkle path.`);
    }

    if (!m.source_kk_audio_is_raw_not_customer_delivery) {
      fail(`${record.ii_id} does not mark raw KK as non-customer delivery.`);
    }
  }
}

if (!checked) fail("No II delivery records checked.");

console.log("PASS: all customer II delivery records have padding + Twinkle together.");
console.log("Records checked:", checked);
