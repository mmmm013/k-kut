import fs from "node:fs";

let failed = false;

function fail(msg) {
  console.error("FAIL:", msg);
  failed = true;
}

function mustContain(file, terms) {
  if (!fs.existsSync(file)) {
    fail(`Missing file: ${file}`);
    return;
  }

  const text = fs.readFileSync(file, "utf8");

  for (const term of terms) {
    if (!text.includes(term)) {
      fail(`${file} missing required term: ${term}`);
    }
  }
}

console.log("PIX REPROCESS LEVEL-SET AUDIT");

mustContain("docs/4pe-learning/GPMC_PIX_REPROCESS_LEVEL_SET_RULE.md", [
  "4PE-BIZ-MSC must re-process ALL PIX / LT-PIX inventory at KK depth",
  "Count KKs",
  "Each PIX may yield multiple KKs",
  "separate KKs from KK-Kombos",
  "Do not expose KK-Kombos publicly on k-kut.com",
  "finished II delivery audio",
  "AUDIO CAN NEVER LEAVE AN II",
  "Father’s Day depth must be counted by KKs, not PIXs",
  "No Mystery",
  "ALL LT-PIX inventory"
]);

mustContain("data/4pe-biz-msc/pix-reprocess-level-set.json", [
  "locked_level_set",
  "Count KKs, not PIXs",
  "all_lt_pix",
  "always_on_depth",
  "kk_kombos_public",
  "finished II delivery audio only",
  "AUDIO CAN NEVER LEAVE AN II",
  "Father’s Day depth is counted by KKs"
]);

if (failed) {
  console.error("");
  console.error("PIX REPROCESS LEVEL-SET AUDIT: FAIL");
  process.exit(1);
}

console.log("PIX REPROCESS LEVEL-SET AUDIT: PASS");
