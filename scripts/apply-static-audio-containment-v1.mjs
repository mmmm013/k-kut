import fs from "node:fs";
import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const manifest = JSON.parse(
  fs.readFileSync("config/current-ii-private-audio.v1.json", "utf8"),
);
const fail = (message) => {
  throw new Error(`STATIC AUDIO CONTAINMENT APPLY FAIL: ${message}`);
};
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

if (process.env.STATIC_AUDIO_CONTAINMENT_APPLY !== "UPLOAD_PRIVATE_AUDIO") {
  fail(
    "refusing mutation; set STATIC_AUDIO_CONTAINMENT_APPLY=UPLOAD_PRIVATE_AUDIO only after APPLY authorization",
  );
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
  process.env.GPMC_KUT_SUPABASE_SECRET_KEY?.trim();
if (!url || !key) fail("Supabase server credentials are missing");
if (!new URL(url).hostname.startsWith(`${manifest.supabase_project_id}.`)) {
  fail("Supabase URL does not match the locked project");
}

const sources = (manifest.records || []).map((record) => {
  if (!fs.existsSync(record.staging_source_path)) {
    fail(`staging source missing ${record.ii_id}`);
  }
  const bytes = fs.readFileSync(record.staging_source_path);
  if (bytes.length !== record.size_bytes || sha256(bytes) !== record.sha256) {
    fail(`staging evidence mismatch ${record.ii_id}`);
  }
  return { record, bytes };
});

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const { data: bucket, error: bucketError } = await supabase.storage.getBucket(
  manifest.storage_bucket,
);
if (bucketError || !bucket) fail("private storage bucket is unavailable");
if (bucket.public !== false) fail("refusing upload because bucket is public");

for (const { record, bytes } of sources) {
  const storage = supabase.storage.from(manifest.storage_bucket);
  const { data: exists } = await storage.exists(record.storage_object_path);
  if (!exists) {
    const { error: uploadError } = await storage.upload(
      record.storage_object_path,
      bytes,
      {
        contentType: "audio/mpeg",
        cacheControl: "0",
        upsert: false,
        metadata: { ii_id: record.ii_id, sha256: record.sha256 },
      },
    );
    if (uploadError) fail(`upload failed ${record.ii_id}: ${uploadError.message}`);
  }

  const { data: downloaded, error: downloadError } = await storage.download(
    record.storage_object_path,
  );
  if (downloadError || !downloaded) {
    fail(`verification download failed ${record.ii_id}`);
  }
  const downloadedBytes = Buffer.from(await downloaded.arrayBuffer());
  if (
    downloadedBytes.length !== record.size_bytes ||
    sha256(downloadedBytes) !== record.sha256
  ) {
    fail(`private object verification failed ${record.ii_id}`);
  }
  console.log(`VERIFIED ${record.ii_id} ${record.sha256}`);
}

console.log("STATIC AUDIO CONTAINMENT PRIVATE UPLOAD: PASS");
console.log("NEXT AUTHORIZED STEP: deploy the already-tested static removals");
