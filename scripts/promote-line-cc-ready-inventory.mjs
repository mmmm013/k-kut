import fs from "node:fs";
import { assertBlkKkMassGenerationAllowed } from "./lib/blk-kk-text-generation-freeze.mjs";

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

const ready = candidates.filter((c) => c.status === "READY_FOR_CC");
const hold = candidates.filter((c) => c.status !== "READY_FOR_CC");

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
    hold_requires_review_reason: true
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
md += `- READY_FOR_CC: ${ready.length}\n`;
md += `- HOLD_REVIEW: ${hold.length}\n\n`;
md += `## READY_FOR_CC by type\n\n`;
for (const [type, count] of Object.entries(byType).sort()) {
  md += `- ${type}: ${count}\n`;
}
md += `\n## Doctrine\n\n`;
md += `- These are CC-ready inventory records, not automatic public release.\n`;
md += `- Each READY_FOR_CC item has SSOT audio reference, exact start/end, lyric text, and non-instrumental eligibility.\n`;
md += `- HOLD_REVIEW items are preserved, not deleted.\n`;
md += `- Final customer-facing use still requires delivery path / dressing-room approval.\n`;

fs.writeFileSync(outTotals, md);

console.log(`WROTE ${outReady}`);
console.log(`WROTE ${outHold}`);
console.log(`WROTE ${outTotals}`);
console.log(JSON.stringify(readyRegistry.totals, null, 2));
