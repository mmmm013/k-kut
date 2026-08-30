import fs from "node:fs";
import path from "node:path";

const read = (file) => fs.readFileSync(file, "utf8");
const parse = (file) => JSON.parse(read(file));
const fail = (message) => {
  throw new Error(`STATIC AUDIO CONTAINMENT AUDIT FAIL: ${message}`);
};

const manifest = parse("config/current-ii-private-audio.v1.json");
const canary = parse("data/production/first-production-canary-v1.json");
const registry = parse(
  "data/ii-delivery-registry/romance-reusable-ii-records.json",
);
const bridge = parse(
  "data/publication-bridge/public-option-records.generated.json",
);
const adminPage = read("app/admin/kkr-authority/page.tsx");
const ownerAudioRoute = read(
  "app/api/admin/kkr-authority/audio/[id]/route.ts",
);
const customerAudioRoute = read(
  "app/api/ii-delivery/[publicOptionId]/route.ts",
);

if (manifest.schema_version !== "current-ii-private-audio-v1") {
  fail("wrong manifest schema");
}
if (
  manifest.storage_bucket !== "ii-delivery" ||
  manifest.bucket_must_be_public !== false
) {
  fail("ii-delivery must remain private");
}
if (
  manifest.signed_url_ttl_seconds !== 300 ||
  manifest.customer_preview_signed_url_ttl_seconds !== 60 ||
  manifest.apply_requires_upload_before_deploy !== true
) {
  fail("owner/customer signing and upload-before-deploy law are not locked");
}
if (!Array.isArray(manifest.records) || manifest.records.length !== 3) {
  fail("expected exactly three contained romance objects");
}

const canaryById = new Map(
  (canary.records || []).map((record) => [record.ii_id, record]),
);
const registryById = new Map(
  (registry.records || []).map((record) => [record.ii_id, record]),
);

for (const record of manifest.records) {
  if (!/^[a-f0-9]{64}$/.test(record.sha256)) {
    fail(`invalid hash ${record.ii_id}`);
  }
  const expectedObject = new RegExp(
    `^current-ii/romance/${record.ii_id}/${record.sha256}\\.mp3$`,
  );
  if (!expectedObject.test(record.storage_object_path)) {
    fail(`non-opaque private object path ${record.ii_id}`);
  }
  if (!record.former_public_static_path.startsWith("/ii-delivery/romance/")) {
    fail(`former public path not documented ${record.ii_id}`);
  }
  const publicFile = path.join(
    process.cwd(),
    "public",
    record.former_public_static_path.replace(/^\//, ""),
  );
  if (fs.existsSync(publicFile)) {
    fail(`static public audio still exists ${record.ii_id}`);
  }

  const registryRecord = registryById.get(record.ii_id);
  if (!registryRecord) fail(`registry record missing ${record.ii_id}`);
  if (registryRecord.delivery_audio_url !== "") {
    fail(`registry retains public delivery URL ${record.ii_id}`);
  }
  if (
    registryRecord.private_delivery_audio?.bucket !== manifest.storage_bucket ||
    registryRecord.private_delivery_audio?.object_path !==
      record.storage_object_path ||
    registryRecord.private_delivery_audio?.visibility !== "private"
  ) {
    fail(`registry private locator mismatch ${record.ii_id}`);
  }

  const canaryRecord = canaryById.get(record.ii_id);
  if (record.owner_review_enabled) {
    if (!canaryRecord || !["TRIAGE", "STAGE"].includes(canaryRecord.status)) {
      fail(`owner-review record has invalid authority ${record.ii_id}`);
    }
    if (
      canaryRecord.delivery_sha256 !== record.sha256 ||
      canaryRecord.private_delivery_audio?.object_path !==
        record.storage_object_path
    ) {
      fail(`canary private locator mismatch ${record.ii_id}`);
    }
  }

  const bridgeRows = (bridge.records || []).filter(
    (row) => row.kk_id_or_delivery_object_id === record.ii_id,
  );
  if (!bridgeRows.length) fail(`publication record missing ${record.ii_id}`);
  const authorizedOptionId =
    canaryRecord?.status === "STAGE"
      ? canaryRecord.release_authority?.authorized_public_option_id
      : "";
  for (const row of bridgeRows) {
    if (row.public_option_id === authorizedOptionId) {
      if (
        row.audio_delivery_url !== `/api/ii-delivery/${authorizedOptionId}` ||
        row.payment_allowed !== true ||
        row.audio_proof_status !== "pass" ||
        record.authority_state !== "STAGE_CONTROLLED_PURCHASE_CANARY" ||
        registryRecord.private_delivery_audio?.apply_state !==
          "UPLOADED_AND_HASH_VERIFIED_2026_08_30"
      ) {
        fail(`controlled canary authority mismatch ${row.public_option_id}`);
      }
    } else if (row.audio_delivery_url !== "" || row.payment_allowed !== false) {
      fail(`held publication row can expose audio or payment ${row.public_option_id}`);
    }
  }
}

for (const file of [
  "app/admin/kkr-authority/page.tsx",
  "data/bic-routes/routes.json",
  "data/bic-usecases/routes.json",
  "data/gpmc-sensory/sensory-emotional-records.generated.json",
  "data/production/first-production-canary-v1.json",
  "data/publication-bridge/public-option-records.generated.json",
  "data/publication-bridge/public-option-records.seed.json",
]) {
  const source = read(file);
  for (const record of manifest.records) {
    if (source.includes(record.former_public_static_path)) {
      fail(`${file} retains an operational static audio path`);
    }
  }
}

for (const required of [
  "/api/admin/kkr-authority/audio/",
  "currentIiOwnerReviewRecords",
]) {
  if (!adminPage.includes(required)) fail(`owner page missing ${required}`);
}
for (const required of [
  "authorized(request)",
  "createSignedUrl(",
  "currentIiPrivateAudio.signedUrlTtlSeconds",
  '"Cache-Control": "private, no-store, max-age=0"',
  '"Referrer-Policy": "no-referrer"',
]) {
  if (!ownerAudioRoute.includes(required)) {
    fail(`owner audio route missing ${required}`);
  }
}
for (const forbidden of ["getPublicUrl(", "/object/public/"]) {
  if (ownerAudioRoute.includes(forbidden)) {
    fail(`owner audio route contains public access primitive ${forbidden}`);
  }
}

for (const required of [
  "findApprovedPublicOptionByPublicOptionId",
  "findCurrentIiPrivateAudio",
  'privateAudio.authority_state !== "STAGE_CONTROLLED_PURCHASE_CANARY"',
  "createSignedUrl(",
  "currentIiPrivateAudio.customerPreviewSignedUrlTtlSeconds",
  '"Cache-Control": "private, no-store, max-age=0"',
]) {
  if (!customerAudioRoute.includes(required)) {
    fail(`customer canary audio route missing ${required}`);
  }
}
for (const forbidden of ["getPublicUrl(", "/object/public/"]) {
  if (customerAudioRoute.includes(forbidden)) {
    fail(`customer audio route contains public access primitive ${forbidden}`);
  }
}

console.log("STATIC AUDIO CONTAINMENT AUDIT: PASS");
console.log("ROMANCE OBJECTS: 3 PRIVATE TARGETS VERIFIED · 0 VERCEL-STATIC");
console.log("CONTROLLED CUSTOMER PREVIEW / PAYMENT AUTHORITY: 0 · OWNER INTEGRITY HOLD");
console.log("OWNER PLAYBACK: TOKEN-GATED · 300-SECOND SIGNED URL");
console.log("CUSTOMER CANARY PREVIEW: DISABLED");
