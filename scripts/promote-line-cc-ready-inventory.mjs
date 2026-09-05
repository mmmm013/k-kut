import fs from "node:fs";
import { assertBlkKkMassGenerationAllowed } from "./lib/blk-kk-text-generation-freeze.mjs";
import { prosecuteSingleBlkCc } from "./lib/cc-single-blk-boundary-law.mjs";
import { validate4peIntakeEvidence } from "./lib/4pe-intake-evidence-gate.mjs";

assertBlkKkMassGenerationAllowed(import.meta.url);

const source = "manifests/kkr/line-cc/lnduo-lntrio-rmst-cc-inventory.json";
const outReady = "manifests/kkr/line-cc/line-cc-ready-registry.json";
const outHold = "manifests/kkr/line-cc/line-cc-hold-review.json";
const outTotals = "reports/ii-inventory-rounded-totals.md";

if (!fs.existsSync(source)) {
  console.error(`STOP: missing ${source}`);
  process.exit(1);
}

const payload = JSON.parse(fs.readFileSync(source, "utf8"));
const candidates = payload.candidates || [];
const prosecuted = candidates.map((candidate) => {
  const boundary = prosecuteSingleBlkCc(candidate, { requireRenderedEndpoint: true });
  const intake = validate4peIntakeEvidence(candidate.method_notes);
  if (candidate.status === "READY_FOR_CC" && boundary.passed && intake.passed) {
    return { ...candidate, boundary_prosecution: boundary };
  }
  return {
    ...candidate,
    status: "HOLD_UNVERIFIED_BOUNDARY",
    hold_reasons: [
      ...(Array.isArray(candidate.hold_reasons) ? candidate.hold_reasons : []),
      ...(candidate.status === "READY_FOR_CC" ? [] : [`source status was ${candidate.status || "missing"}`]),
      ...boundary.reasons,
      ...intake.reasons,
    ],
    boundary_prosecution: boundary,
  };
});

const ready = prosecuted.filter((c) => c.status === "READY_FOR_CC" && c.boundary_prosecution?.passed === true);
const hold = prosecuted.filter((c) => c.status !== "READY_FOR_CC" || c.boundary_prosecution?.passed !== true);

const byType = {};
for (const row of ready) {
  byType[row.type] = (byType[row.type] || 0) + 1;
}

const readyRegistry = {
  generated_at: new Date().toISOString(),
  doctrine: {
    no_auto_release: true,
    no_placeholders: true,
    cc_requires_ssot_audio_url: true,
    cc_requires_exact_start_end: true,
    cc_requires_exactly_one_blk_id: true,
    cc_requires_authoritative_blk_containment: true,
    cc_requires_ffprobe_verified_rendered_endpoint: true,
    instrumental_rejected: true,
    ready_for_cc_requires_final_materialization_or_existing_delivery_path: true
  },
  totals: {
    ready_total: ready.length,
    hold_total: hold.length,
    ready_by_type: byType
  },
  ready_ccs: ready
};

const holdRegistry = {
  generated_at: new Date().toISOString(),
  doctrine: {
    rejected_not_deleted: true,
    hold_requires_review_reason: true,
    unverified_boundary_defaults_to_hold: true
  },
  totals: {
    hold_total: hold.length
  },
  hold_review: hold
};

fs.writeFileSync(outReady, JSON.stringify(readyRegistry, null, 2));
fs.writeFileSync(outHold, JSON.stringify(holdRegistry, null, 2));

let md = `# II Inventory Rounded Totals — Line CC Recovery\n\n`;
md += `Generated: ${new Date().toISOString()}\n\n`;
md += `## Line CC Review Result\n\n`;
md += `- Total reviewed: ${candidates.length}\n`;
md += `- READY_FOR_CC after boundary prosecution: ${ready.length}\n`;
md += `- HOLD_UNVERIFIED_BOUNDARY / other hold: ${hold.length}\n\n`;
md += `## READY_FOR_CC by type\n\n`;
for (const [type, count] of Object.entries(byType).sort()) {
  md += `- ${type}: ${count}\n`;
}
md += `\n## Doctrine\n\n`;
md += `- These are CC-ready inventory records, not automatic public release.\n`;
md += `- Each READY_FOR_CC item proves exactly one blk_id and CC.start >= BLK.start and CC.end <= BLK.end.\n`;
md += `- Each READY_FOR_CC item has an existing rendered audio file whose duration is measured by ffprobe and matches the CC source window.\n`;
md += `- Unverified or cross-BLK items are reclassified HOLD_UNVERIFIED_BOUNDARY and preserved, not deleted.\n`;
md += `- Final customer-facing use still requires delivery path / dressing-room approval.\n`;

fs.writeFileSync(outTotals, md);

console.log(`WROTE ${outReady}`);
console.log(`WROTE ${outHold}`);
console.log(`WROTE ${outTotals}`);
console.log(JSON.stringify(readyRegistry.totals, null, 2));
