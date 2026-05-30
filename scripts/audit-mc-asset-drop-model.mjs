import fs from "node:fs";

const docPath = "docs/4pe-learning/MC_ASSET_DROP_OPERATING_MODEL.md";
const dataPath = "data/asset-ingest/mc-asset-drop-model.json";

let fail = false;

for (const p of [docPath, dataPath]) {
  if (!fs.existsSync(p)) {
    console.error("FAIL missing", p);
    fail = true;
  } else {
    console.log("OK exists", p);
  }
}

const doc = fs.existsSync(docPath) ? fs.readFileSync(docPath, "utf8") : "";
const data = fs.existsSync(dataPath) ? fs.readFileSync(dataPath, "utf8") : "";

for (const phrase of [
  "MC adds assets to a simple shared folder",
  "Greg/GPM reviews and imports",
  "Vercel is not the easy asset explorer",
  "Uploaded assets are not public",
  "production BIC audit PASS"
]) {
  if (!doc.includes(phrase) && !data.includes(phrase)) {
    console.error("FAIL missing phrase", phrase);
    fail = true;
  } else {
    console.log("OK phrase", phrase);
  }
}

if (fail) process.exit(1);

console.log("PASS: MC asset drop operating model is locked.");
