import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const BASE = "/Users/gputnammusicllc/GPM_LOCAL_VAULT/09_Registry/RAPID_DEPLOYMENT_429_KK_SALES_GATE_V004_20260712-000531";
const MAP = path.join(BASE, "05_DEPLOYMENT_MAP", "01_GPMX_2611_DELIVERY_DEPLOYMENT_MAP.csv");
const OUT = path.join(BASE, "05_PUBLIC_SUPABASE_II_DEPLOYMENT_V001");
const BUCKET = "ii-delivery";
const PREFIX = "release-gate-v004";
const STATE = path.join(OUT, "01_UPLOAD_STATE.jsonl");
const CATALOG = path.join(OUT, "02_PUBLIC_II_CATALOG.json");
const SUMMARY = path.join(OUT, "03_PUBLIC_II_DEPLOYMENT_SUMMARY.txt");

function stop(message) {
  console.error(`\nSTOP: ${message}`);
  process.exit(1);
}

function truthy(value) {
  return new Set([
    "1",
    "true",
    "yes",
    "pass",
    "passed",
    "present",
    "verified",
    "at_end",
    "end",
  ]).has(String(value || "").trim().toLowerCase());
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];

    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
      continue;
    }

    if (character === '"') {
      quoted = true;
    } else if (character === ",") {
      row.push(field);
      field = "";
    } else if (character === "\n") {
      row.push(field.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }

  if (quoted) stop("deployment map ends inside a quoted CSV field");

  if (field.length || row.length) {
    row.push(field.replace(/\r$/, ""));
    rows.push(row);
  }

  const nonblank = rows.filter((values) =>
    values.some((value) => String(value).trim()),
  );

  if (nonblank.length < 2) stop("deployment map contains no data rows");

  const headers = nonblank[0].map((value) => String(value).trim());

  return nonblank.slice(1).map((values, index) => {
    if (values.length !== headers.length) {
      stop(
        `deployment map row ${index + 2} has ${values.length} columns; ` +
          `expected ${headers.length}`,
      );
    }

    return Object.fromEntries(
      headers.map((header, column) => [
        header,
        String(values[column] ?? "").trim(),
      ]),
    );
  });
}

if (!fs.existsSync(MAP)) stop(`deployment map missing: ${MAP}`);
fs.mkdirSync(OUT, { recursive: true });

const rows = parseCsv(fs.readFileSync(MAP, "utf8").replace(/^\uFEFF/, ""));
if (rows.length !== 2611) {
  stop(`deployment map has ${rows.length} rows; expected 2611`);
}

const jobs = rows.map((row, index) => {
  const inventoryId = row.sales_inventory_id;
  const sourcePath = row.local_verified_capsule_path;

  if (!inventoryId) stop(`row ${index + 2}: missing sales_inventory_id`);
  if (!sourcePath || !fs.existsSync(sourcePath)) {
    stop(`${inventoryId}: local capsule missing: ${sourcePath}`);
  }

  const stat = fs.statSync(sourcePath);
  if (!stat.isFile() || stat.size === 0) {
    stop(`${inventoryId}: local capsule is missing or empty`);
  }
  if (!sourcePath.toLowerCase().endsWith(".mp3")) {
    stop(`${inventoryId}: capsule is not MP3`);
  }
  if (
    row.local_capsule_size_bytes &&
    Number(row.local_capsule_size_bytes) !== stat.size
  ) {
    stop(`${inventoryId}: local size no longer matches deployment map`);
  }
  if (
    row.signature_audio_logo_integral_at_end &&
    !truthy(row.signature_audio_logo_integral_at_end)
  ) {
    stop(`${inventoryId}: Twinkle-at-end proof is not passing`);
  }

  const fileName = path
    .basename(sourcePath)
    .replace(/[^A-Za-z0-9._-]+/g, "-");

  return {
    row,
    inventoryId,
    sourcePath,
    fileName,
    objectPath: `${PREFIX}/${fileName}`,
    sizeBytes: stat.size,
  };
});

if (new Set(jobs.map((job) => job.inventoryId)).size !== 2611) {
  stop("inventory IDs are not unique");
}
if (new Set(jobs.map((job) => job.objectPath)).size !== 2611) {
  stop("public object paths are not unique");
}

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
const serverKey =
  process.env.SUPABASE_SECRET_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  "";

if (!supabaseUrl) stop("Supabase project URL is missing");
if (!serverKey) stop("Supabase server key is missing");

console.log("GPMx 2611 II STORAGE DEPLOYMENT");
console.log("=".repeat(76));
console.log("DEPLOYMENT MAP ROWS:", rows.length);
console.log("SECRET VALUE PRINTED: NO");

const supabase = createClient(supabaseUrl, serverKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: buckets, error: bucketError } =
  await supabase.storage.listBuckets();
if (bucketError) {
  stop(`Supabase authentication failed: ${bucketError.message}`);
}

const existingBucket = (buckets || []).find(
  (bucket) => bucket.name === BUCKET,
);

if (!existingBucket) {
  const { error } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: 50 * 1024 * 1024,
    allowedMimeTypes: ["audio/mpeg", "application/json", "text/csv"],
  });
  if (error) stop(`could not create ${BUCKET}: ${error.message}`);
  console.log("BUCKET CREATED PUBLIC:", BUCKET);
} else if (!existingBucket.public) {
  const { error } = await supabase.storage.updateBucket(BUCKET, {
    public: true,
    fileSizeLimit: 50 * 1024 * 1024,
    allowedMimeTypes: ["audio/mpeg", "application/json", "text/csv"],
  });
  if (error) stop(`could not make ${BUCKET} public: ${error.message}`);
  console.log("BUCKET UPDATED TO PUBLIC:", BUCKET);
} else {
  console.log("BUCKET ALREADY PUBLIC:", BUCKET);
}

const completed = new Set();
if (fs.existsSync(STATE)) {
  for (const line of fs.readFileSync(STATE, "utf8").split(/\r?\n/)) {
    if (!line.trim()) continue;
    try {
      const record = JSON.parse(line);
      if (record.object_path) completed.add(record.object_path);
    } catch {
      stop(`invalid resume record in ${STATE}`);
    }
  }
}

let cursor = 0;
let processed = 0;
let uploadedNow = 0;
let alreadyPresent = 0;
let resumeSkipped = 0;

function appendState(job, disposition) {
  const publicUrl = supabase.storage
    .from(BUCKET)
    .getPublicUrl(job.objectPath).data.publicUrl;

  fs.appendFileSync(
    STATE,
    `${JSON.stringify({
      inventory_id: job.inventoryId,
      object_path: job.objectPath,
      public_url: publicUrl,
      disposition,
      recorded_at: new Date().toISOString(),
    })}\n`,
    "utf8",
  );

  completed.add(job.objectPath);
}

function progress() {
  processed += 1;
  if (processed === 1 || processed % 25 === 0 || processed === jobs.length) {
    console.log(
      `PROGRESS ${processed}/${jobs.length} | ` +
        `uploaded=${uploadedNow} | existing=${alreadyPresent} | ` +
        `resumed=${resumeSkipped}`,
    );
  }
}

async function worker() {
  while (true) {
    const index = cursor;
    cursor += 1;
    if (index >= jobs.length) return;

    const job = jobs[index];
    if (completed.has(job.objectPath)) {
      resumeSkipped += 1;
      progress();
      continue;
    }

    const { error } = await supabase.storage.from(BUCKET).upload(
      job.objectPath,
      fs.readFileSync(job.sourcePath),
      {
        contentType: "audio/mpeg",
        cacheControl: "31536000",
        upsert: false,
      },
    );

    if (error) {
      const message = String(error.message || "");
      const status = String(error.statusCode || error.status || "");
      const alreadyExists =
        status === "409" ||
        /already exists|duplicate|resource exists/i.test(message);

      if (!alreadyExists) {
        throw new Error(`${job.inventoryId}: ${message || status}`);
      }

      alreadyPresent += 1;
      appendState(job, "ALREADY_PRESENT");
    } else {
      uploadedNow += 1;
      appendState(job, "UPLOADED");
    }

    progress();
  }
}

try {
  await Promise.all(Array.from({ length: 4 }, () => worker()));
} catch (error) {
  stop(error instanceof Error ? error.message : String(error));
}

async function listAllObjects() {
  const found = [];
  let offset = 0;

  while (true) {
    const { data, error } = await supabase.storage.from(BUCKET).list(PREFIX, {
      limit: 100,
      offset,
      sortBy: { column: "name", order: "asc" },
    });

    if (error) stop(`public verification failed: ${error.message}`);

    const page = data || [];
    found.push(
      ...page.filter((item) => item.name.toLowerCase().endsWith(".mp3")),
    );

    if (page.length < 100) break;
    offset += page.length;
  }

  return found;
}

const uploadedObjects = await listAllObjects();
if (uploadedObjects.length !== 2611) {
  stop(
    `public storage contains ${uploadedObjects.length}/2611 MP3s; ` +
      "run the same command again to resume",
  );
}

const catalogRecords = jobs.map((job) => ({
  inventory_id: job.inventoryId,
  inventory_family: job.row.inventory_family,
  delivery_offer: job.row.delivery_offer,
  delivery_price_usd: job.row.delivery_price_usd,
  primary_use_lane: job.row.primary_use_lane,
  lt_pix_parent_id: job.inventoryId.replace(/-KK-\d+$/i, ""),
  public_audio_url: supabase.storage
    .from(BUCKET)
    .getPublicUrl(job.objectPath).data.publicUrl,
  object_path: job.objectPath,
  local_capsule_sha256: job.row.local_capsule_sha256,
  local_capsule_size_bytes: job.sizeBytes,
  signature_audio_logo_integral_at_end:
    job.row.signature_audio_logo_integral_at_end,
  public_storage_status: "PUBLIC_STORAGE_VERIFIED",
}));

const catalog = {
  status: "PUBLIC_II_INVENTORY_STORAGE_VERIFIED",
  generated_at: new Date().toISOString(),
  source_deployment_map: MAP,
  bucket: BUCKET,
  prefix: PREFIX,
  inventory_count: catalogRecords.length,
  records: catalogRecords,
};

fs.writeFileSync(CATALOG, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");

for (const [objectPath, localPath] of [
  ["catalog/public-ii-catalog.json", CATALOG],
  ["catalog/2611-deployment-map.csv", MAP],
]) {
  const { error } = await supabase.storage.from(BUCKET).upload(
    objectPath,
    fs.readFileSync(localPath),
    {
      contentType: objectPath.endsWith(".json")
        ? "application/json"
        : "text/csv",
      cacheControl: "300",
      upsert: true,
    },
  );
  if (error) stop(`catalog publication failed for ${objectPath}: ${error.message}`);
}

for (const job of [
  jobs[0],
  jobs[Math.floor(jobs.length / 2)],
  jobs[jobs.length - 1],
]) {
  const url = supabase.storage
    .from(BUCKET)
    .getPublicUrl(job.objectPath).data.publicUrl;
  const response = await fetch(url, { headers: { Range: "bytes=0-0" } });
  if (!response.ok && response.status !== 206) {
    stop(`${job.inventoryId}: public URL returned HTTP ${response.status}`);
  }
}

const catalogUrl = supabase.storage
  .from(BUCKET)
  .getPublicUrl("catalog/public-ii-catalog.json").data.publicUrl;

const summary = [
  "GPMx 2611 PUBLIC II STORAGE DEPLOYMENT",
  "======================================",
  `PUBLIC MP3 OBJECTS VERIFIED: ${uploadedObjects.length}`,
  `UPLOADED THIS RUN: ${uploadedNow}`,
  `ALREADY PRESENT: ${alreadyPresent}`,
  `RESUME-SKIPPED: ${resumeSkipped}`,
  `PUBLIC CATALOG RECORDS: ${catalogRecords.length}`,
  `PUBLIC CATALOG URL: ${catalogUrl}`,
  `LOCAL CATALOG: ${CATALOG}`,
  `UPLOAD STATE: ${STATE}`,
  "SOURCE AUDIO CHANGED: 0",
  "AUDIO REBUILT: 0",
  "PASS: ALL 2611 IIs ARE IN VERIFIED PUBLIC STORAGE",
  "",
].join("\n");

fs.writeFileSync(SUMMARY, summary, "utf8");
console.log(`\n${summary}`);
