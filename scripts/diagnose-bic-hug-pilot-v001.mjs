import fs from "node:fs";

let status = "PASS";
let firstError = "";

try {
  await import("./audit-bic-hug-revenue-pilot-v001.mjs");
} catch (reason) {
  status = "FAIL";
  firstError = reason instanceof Error ? reason.message : "unidentified_error";
}

const redactedError = firstError
  .replace(/LT-PIX-[A-Za-z0-9_-]+/gu, "[REDACTED_LT_PIX_ID]")
  .replace(
    /[A-Za-z0-9_-]*[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/giu,
    "[REDACTED_INVENTORY_ID]",
  );

fs.writeFileSync(
  "public/bic-audit-diagnostic-v001.json",
  `${JSON.stringify(
    {
      schema_version: "BIC_HUG_AUDIT_DIAGNOSTIC_V001",
      preview_only: true,
      status,
      first_error: redactedError,
    },
    null,
    2,
  )}\n`,
);

console.log(`BIC HUG AUDIT TEMPORARY DIAGNOSTIC: ${status}`);
