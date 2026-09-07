import fs from "node:fs";

const migrationPath = "supabase/migrations/20260907181541_four_pe_disco_production_factory_v1.sql";
const stagePath = "app/api/admin/4pe/stage/route.ts";
const workerPath = "app/api/internal/4pe/jobs/route.ts";
const reviewerPath = "app/api/admin/kut-reviewer/queue/route.ts";

const migration = fs.readFileSync(migrationPath, "utf8");
const stabilization = fs.readFileSync("supabase/migrations/20260907183041_four_pe_kk_stabilization_lock_v1.sql", "utf8");
const stage = fs.readFileSync(stagePath, "utf8");
const worker = fs.readFileSync(workerPath, "utf8");
const service = fs.readFileSync("lib/fourPe/service.ts", "utf8");
const reviewer = fs.readFileSync(reviewerPath, "utf8");
const failures = [];
const requireText = (text, needle, label) => { if (!text.includes(needle)) failures.push(label); };

requireText(migration, "'source_system','DISCO_STL'", "DISCO STL source authority missing");
requireText(migration, "'MIXED_LT_PIX','VOCAL_STEM','INSTRO_STEM'", "mixed/stem lineage roles missing");
requireText(migration, "VOCAL and INSTRO stem evidence required", "two-stem fail-closed gate missing");
requireText(stabilization, "requested_types = array['KK']::text[]", "KK-only stabilization lock missing");
requireText(migration, "where stage_state = 'STAGED'", "Next Run snapshot filter missing");
requireText(migration, "'0 */12 * * *'", "12-hour scheduler missing");
requireText(migration, "catalog_state = 'ARCHIVED'", "replacement archive lifecycle missing");
requireText(stage, '.eq("pix_source_type", "LT-PIX")', "stored LT-PIX authority selection missing from staging API");
requireText(stage, 'authority: "DISCO_STL"', "DISCO STL source lineage missing from staging API");
requireText(service, "FOUR_PE_WORKER_SECRET", "machine-only worker authentication missing");
requireText(worker, "gpm_4pe_complete_step", "atomic worker completion RPC missing");
requireText(reviewer, "gpm_4pe_ii_catalog", "TPR is not reading the immutable II catalog");

if (failures.length) {
  console.error("4PE PRODUCTION FACTORY AUDIT: FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("4PE PRODUCTION FACTORY AUDIT: PASS");
console.log("SOURCE: one DISCO STL mixed LT-PIX");
console.log("DERIVED: VOCAL + INSTRO stems");
console.log("CURRENT TYPE: KK only");
console.log("CADENCE: staged changes every 12 hours");
console.log("CATALOG: stable; exact replacements archived");
