import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env.production.local", override: false });

const now = new Date().toISOString().replace(/[:.]/g, "-");
const outPath = `reports/kk-inventory-${now}.md`;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const lines = [];
const failures = [];

function add(s = "") {
  lines.push(s);
}

function section(title) {
  add("");
  add(`## ${title}`);
  add("");
}

function safeListFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  const walk = (p) => {
    for (const name of fs.readdirSync(p)) {
      const full = path.join(p, name);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) walk(full);
      else out.push({ path: full, size: stat.size });
    }
  };
  walk(dir);
  return out.sort((a, b) => a.path.localeCompare(b.path));
}

async function tableInventory(schema, table, select = "*") {
  try {
    const client = createClient(supabaseUrl, serviceKey, { db: { schema } });

    const countRes = await client
      .from(table)
      .select("*", { count: "exact", head: true });

    if (countRes.error) {
      failures.push(`${schema}.${table}: ${countRes.error.message}`);
      return null;
    }

    const sampleRes = await client
      .from(table)
      .select(select)
      .limit(50);

    if (sampleRes.error) {
      failures.push(`${schema}.${table} sample: ${sampleRes.error.message}`);
      return { schema, table, count: countRes.count ?? 0, sample: [] };
    }

    return {
      schema,
      table,
      count: countRes.count ?? 0,
      sample: sampleRes.data ?? [],
    };
  } catch (err) {
    failures.push(`${schema}.${table}: ${err.message}`);
    return null;
  }
}

add("# KK / K-KUT Full Inventory");
add("");
add(`Generated: ${new Date().toISOString()}`);
add(`Repo: ${process.cwd()}`);

section("Environment");
add(`Supabase URL present: ${Boolean(supabaseUrl)}`);
add(`Service key present: ${Boolean(serviceKey)}`);

if (!supabaseUrl || !serviceKey) {
  add("");
  add("STOP: missing Supabase env.");
  fs.writeFileSync(outPath, lines.join("\n"));
  console.log(lines.join("\n"));
  process.exit(1);
}

section("Public Audio Files");
const audioFiles = safeListFiles("public/audio");
add(`Total public/audio files: ${audioFiles.length}`);
for (const f of audioFiles) {
  add(`- ${f.path} | ${f.size} bytes`);
}

section("Public Audio Manifests");
const manifests = audioFiles.filter((f) => f.path.endsWith("manifest.json"));
add(`Manifest count: ${manifests.length}`);
for (const m of manifests) {
  try {
    const data = JSON.parse(fs.readFileSync(m.path, "utf8"));
    add(`- ${m.path}`);
    add(`  - artist: ${data.artist ?? ""}`);
    add(`  - set: ${data.set ?? ""}`);
    add(`  - items: ${Array.isArray(data.items) ? data.items.length : "n/a"}`);
    add(`  - unique_recordings: ${data.unique_recordings ?? ""}`);
    add(`  - total_captured: ${data.total_captured ?? ""}`);
  } catch (err) {
    add(`- ${m.path} | JSON ERROR: ${err.message}`);
  }
}

section("Supabase Inventory");

// Public schema candidates
const publicTables = [
  ["public", "tracks", "id,title,bucket_id,storage_path,mp3_url,audio_url,created_at"],
  ["public", "k_kuts", "*"],
  ["public", "mks", "*"],
  ["public", "pix", "*"],
];

// App schema candidates
const appTables = [
  ["app", "pix", "id,title,artist,structure_type,duration_ms,audio_url,mp3_url,created_at"],
  ["app", "kuts", "id,title,product_type,status,source_pix_id,duration_ms,audio_url,delivered_url_or_path,created_at"],
  ["app", "mks", "id,title,status,source_track_id,start_ms,end_ms,audio_url,created_at"],
  ["app", "dps", "*"],
  ["app", "reaction_packs", "*"],
];

const inventories = [];
for (const [schema, table, select] of [...publicTables, ...appTables]) {
  const inv = await tableInventory(schema, table, select);
  if (inv) inventories.push(inv);
}

for (const inv of inventories) {
  section(`${inv.schema}.${inv.table}`);
  add(`Count: ${inv.count}`);
  add("");
  add("Sample:");
  for (const row of inv.sample.slice(0, 20)) {
    const id = row.id ?? "";
    const title = row.title ?? row.name ?? "";
    const product = row.product_type ? ` | product_type=${row.product_type}` : "";
    const status = row.status ? ` | status=${row.status}` : "";
    const bucket = row.bucket_id ? ` | bucket=${row.bucket_id}` : "";
    const storage = row.storage_path ? ` | path=${row.storage_path}` : "";
    const url = row.mp3_url || row.audio_url || row.delivered_url_or_path || "";
    add(`- ${id} | ${title}${product}${status}${bucket}${storage}${url ? ` | url=${url}` : ""}`);
  }
}

section("Storage Bucket Risk Scan");
const tracks = inventories.find((x) => x.schema === "public" && x.table === "tracks");
if (tracks) {
  const buckets = new Map();
  for (const row of tracks.sample) {
    const b = row.bucket_id || "(blank)";
    buckets.set(b, (buckets.get(b) || 0) + 1);
  }
  add("Sample bucket IDs:");
  for (const [bucket, count] of buckets) {
    add(`- ${bucket}: ${count}`);
  }
  add("");
  add("GPEx LAW: preferred doctrine is bucket='tracks' with folder paths such as kleigh/guide-final/file.m4a, not person-named buckets.");
}

section("Failures / Missing Tables");
if (failures.length === 0) {
  add("None.");
} else {
  for (const f of failures) add(`- ${f}`);
}

fs.writeFileSync(outPath, lines.join("\n"));
console.log(lines.join("\n"));
console.log("");
console.log(`REPORT_WRITTEN=${outPath}`);
