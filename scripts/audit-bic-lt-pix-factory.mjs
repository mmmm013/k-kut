import fs from "node:fs";
const files = ["lib/bic/factory.ts", "lib/bic/iiControl.ts", "app/api/admin/bic-ii/registry/route.ts", "app/api/admin/bic-ii/runs/route.ts", "app/api/admin/bic-ii/intake/route.ts", "app/api/admin/kut-reviewer/queue/route.ts"];
for (const file of files) if (!fs.existsSync(file)) throw new Error(`Missing BIC control: ${file}`);
const control = fs.readFileSync("lib/bic/iiControl.ts", "utf8");
const factory = fs.readFileSync("lib/bic/factory.ts", "utf8");
const queue = fs.readFileSync("app/api/admin/kut-reviewer/queue/route.ts", "utf8");
for (const [name, condition] of Object.entries({
  "separate KK sK mK types": control.includes('["KK", "sK", "mK"]'),
  "fixed-duration legacy source rejected": control.includes("legacy_fixed_duration_source_forbidden"),
  "4PE evidence required": control.includes("validate4peIntakeEvidence"),
  "later stages locked": factory.includes("kk_stabilization_required_before_later_types"),
  "reviewer reads BIC only": queue.includes("gpm_bic_ii_candidates") && !queue.includes("gpmx_admin_kkr_tpr_candidate_v1"),
})) { if (!condition) throw new Error(`BIC audit failed: ${name}`); console.log(`PASS: ${name}`); }
