import fs from "node:fs";

const strictAuthorityPath = "data/kkr-vtp-end-authority/comin_true.strict-v1.json";

if (!fs.existsSync(strictAuthorityPath)) {
  throw new Error(
    "LEGACY MATERIALIZER DISABLED: Comin' True may only be rebuilt from exact owner/KKr-proven VTP-END authority. " +
    `Missing ${strictAuthorityPath}. Fixed-duration or inherited timestamp windows are forbidden.`
  );
}

const authority = JSON.parse(fs.readFileSync(strictAuthorityPath, "utf8"));
if (authority.schema_version !== "GPMX_COMIN_TRUE_STRICT_VTP_END_AUTHORITY_V1") {
  throw new Error("STRICT VTP-END AUTHORITY INVALID: wrong schema version");
}
if (authority.status !== "COMPLETE_STRICT_VTP_END_AUTHORITY") {
  throw new Error("STRICT VTP-END AUTHORITY INCOMPLETE: HOLD all Comin' True II rerenders");
}
if (!Array.isArray(authority.items) || authority.items.length === 0) {
  throw new Error("STRICT VTP-END AUTHORITY EMPTY");
}

for (const item of authority.items) {
  if (item.boundary_prosecution_state !== "STRICT_VTP_END_NO_CUTOFF_PASS") {
    throw new Error(`UNPROVEN II BOUNDARY: ${item.ii_key || "UNKNOWN"}`);
  }
  if (!Number.isFinite(item.source_start_sec) || !Number.isFinite(item.vtp_end_sec)) {
    throw new Error(`MISSING EXACT BOUNDARY: ${item.ii_key || "UNKNOWN"}`);
  }
  if (item.vtp_end_sec <= item.source_start_sec) {
    throw new Error(`INVALID BOUNDARY ORDER: ${item.ii_key || "UNKNOWN"}`);
  }
  if (item.post_vocal_audio_allowed !== false) {
    throw new Error(`POST-VOCAL AUDIO FORBIDDEN: ${item.ii_key || "UNKNOWN"}`);
  }
}

throw new Error(
  "STRICT AUTHORITY PRESENT, BUT THIS LEGACY MATERIALIZER REMAINS RETIRED. " +
  "Use the new VTP-END materializer only; never restore fixed-window arrays."
);
