import fs from "node:fs";

const worklistPath = "data/kkr-captured-cc-correction-worklists/comin_true.deduplicated-v1.json";

if (!fs.existsSync(worklistPath)) {
  throw new Error(`CAPTURED-CC WORKLIST MISSING: ${worklistPath}`);
}

const worklist = JSON.parse(fs.readFileSync(worklistPath, "utf8"));
if (worklist.schema_version !== "GPMX_DEDUPLICATED_CAPTURED_CC_CORRECTION_WORKLIST_V1") {
  throw new Error("CAPTURED-CC WORKLIST INVALID: wrong schema");
}
if (worklist.authority_source_kind !== "CAPTURED_CC_AUTHORITY_ONLY") {
  throw new Error("CAPTURED-CC WORKLIST INVALID: only captured CC may be source authority");
}
if (worklist.discovery_search_permitted !== false || worklist.fresh_lt_pix_pass_permitted !== false) {
  throw new Error("CAPTURED-CC WORKLIST INVALID: fresh discovery/search is forbidden");
}

throw new Error(
  "LEGACY MATERIALIZER RETIRED. Use scripts/kkr/materialize-from-captured-cc-worklist-v1.mjs " +
  worklistPath
);
