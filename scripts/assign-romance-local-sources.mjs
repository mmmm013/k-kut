import fs from "node:fs";

const registryPath = "data/ii-delivery-registry/romance-reusable-ii-records.json";

const LOCAL_SOURCES = {
  "A LOVE LIKE THAT": "/Users/gregoryputnam/GPM STL MP3s/A LOVE LIKE THAT.mp3",
  "YOUR HEART POUNDIN'": "/Users/gregoryputnam/Movies/G Putnam Music, LLC - Shine the Light (STL) - GPM Inventory 12 2025/YOUR HEART POUNDIN' .mp3",
  "Don't Call It Love": "/Users/gregoryputnam/Music/DON'T CALL IT LOVE -.mp3"
};

function fail(msg) {
  console.error("FAIL:", msg);
  process.exit(1);
}

if (!fs.existsSync(registryPath)) fail(`Missing registry: ${registryPath}`);

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));

for (const record of registry.records || []) {
  const source = LOCAL_SOURCES[record.public_label];

  if (!source) {
    fail(`No local source mapping for ${record.public_label}`);
  }

  if (/instro|instrumental/i.test(source)) {
    fail(`INSTRO / instrumental source forbidden: ${source}`);
  }

  if (!fs.existsSync(source)) {
    fail(`Local source does not exist: ${source}`);
  }

  record.local_source_path = source;
  record.source_resolution = {
    method: "local_gpmc_source_first",
    local_source_path: source,
    remote_supabase_url_not_required_for_customer_delivery: true,
    no_instrumental_allowed: true
  };
}

registry.status = "ready_for_materialization_with_local_gpmc_sources";
registry.source_resolution_doctrine = [
  "Use local GPMC PIX/source files first.",
  "Supabase source URLs are not required for customer delivery materialization.",
  "No INSTRO / instrumental sources.",
  "Padding and Twinkle travel together for all customer delivery II records."
];

fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2) + "\n");

console.log("PASS: assigned local GPMC source paths.");
for (const record of registry.records || []) {
  console.log(`${record.public_label}: ${record.local_source_path}`);
}
