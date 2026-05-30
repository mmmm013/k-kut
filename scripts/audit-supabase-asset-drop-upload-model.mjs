
import fs from "node:fs";

const requiredFiles = [
  "app/asset-drop/page.tsx",
  "app/api/asset-drop/upload/route.ts",
  "docs/4pe-learning/SUPABASE_ASSET_DROP_UPLOAD_MODEL.md",
  "data/asset-ingest/supabase-asset-drop-upload-model.json"
];

let fail = false;

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    console.error("FAIL missing", file);
    fail = true;
  } else {
    console.log("OK exists", file);
  }
}

const joined = requiredFiles
  .filter((file) => fs.existsSync(file))
  .map((file) => fs.readFileSync(file, "utf8"))
  .join("\n");

for (const phrase of [
  "asset-drop",
  "pending_greg_review",
  "Uploaded = received",
  "Greg/GPM reviews everything",
  "MC may upload",
  "BIC production audit PASS"
]) {
  if (!joined.includes(phrase)) {
    console.error("FAIL missing phrase", phrase);
    fail = true;
  } else {
    console.log("OK phrase", phrase);
  }
}

if (fail) process.exit(1);

console.log("PASS: Supabase asset-drop upload model is present.");
