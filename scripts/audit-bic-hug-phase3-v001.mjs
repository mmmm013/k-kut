import fs from "node:fs";
import path from "node:path";

const json = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const fail = (message) => {
  throw new Error(`BIC PHASE 3 FAIL: ${message}`);
};

const pilot = json("data/hug-pilot/bic-hug-revenue-pilot-v001.json");
const publication = json(
  "data/publication-bridge/public-option-records.generated.json",
);
const catalog = fs.readFileSync("lib/hugzSeedCatalog.ts", "utf8");
const publicationRecords = publication.records || [];
const heldSeedIds = new Set(
  [...catalog.matchAll(/"assetId"\s*:\s*"([^"]+)"/gu)].map(
    (match) => match[1],
  ),
);

for (const record of pilot.records || []) {
  const approved = publicationRecords.find(
    (candidate) =>
      candidate.kk_id_or_delivery_object_id === record.ii_id &&
      candidate.approval_status ===
        "public_approved_generated_from_reusable_ii" &&
      candidate.audio_proof_status === "pass" &&
      candidate.payment_allowed === true &&
      candidate.audio_delivery_url === record.audio_url &&
      String(candidate.stripe_url_if_payment_allowed || "").startsWith(
        "https://buy.stripe.com/",
      ),
  );
  if (!approved) fail("publication/payment authority");

  const audioPath = path.join(
    process.cwd(),
    "public",
    record.audio_url.replace(/^\//u, ""),
  );
  if (!fs.existsSync(audioPath)) fail("delivery audio file");
  if (fs.statSync(audioPath).size < 100000) fail("delivery audio size");

  if (heldSeedIds.has(record.ii_id) || heldSeedIds.has(record.kk_id)) {
    fail("pilot item overlaps held 104 seed identities");
  }
}

console.log("BIC HUG AUDIT PHASE 3: PASS");
