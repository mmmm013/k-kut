import fs from "node:fs";

const registryPath = "data/ii-delivery-registry/kupid-valentine-reuse.json";
const inventoryPath = "reports/kk-inventory/k_kuts.auto.csv";

if (!fs.existsSync(registryPath)) {
  console.error("Missing registry:", registryPath);
  process.exit(1);
}

if (!fs.existsSync(inventoryPath)) {
  console.error("Missing inventory:", inventoryPath);
  process.exit(1);
}

const csv = fs.readFileSync(inventoryPath, "utf8");
const lines = csv.split(/\r?\n/).filter(Boolean);

function parseCsvLine(line) {
  const out = [];
  let cur = "";
  let quoted = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    const next = line[i + 1];

    if (ch === '"' && quoted && next === '"') {
      cur += '"';
      i++;
    } else if (ch === '"') {
      quoted = !quoted;
    } else if (ch === "," && !quoted) {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }

  out.push(cur);
  return out;
}

const candidates = [];
const adminMkCandidates = [];
const seen = new Set();

for (const line of lines) {
  if (!line.includes("YOUR TOUCH")) continue;

  const cols = parseCsvLine(line);

  const id = cols[0] || "";
  const title = cols[1] || "";
  const type = cols[2] || "";
  const sourceId = cols[3] || "";
  const sourceFile = cols[4] || "";
  const start = Number(cols[9] || 0);
  const end = Number(cols[10] || 0);
  const method = cols[11] || "";
  const audioUrl = cols.find((v) => /^https?:\/\//.test(v)) || "";

  if (!id || seen.has(id)) continue;
  seen.add(id);

  const item = {
    id,
    type,
    title,
    source_id: sourceId,
    source_file: sourceFile,
    start_seconds: Number.isFinite(start) ? start : null,
    end_seconds: Number.isFinite(end) ? end : null,
    method,
    audio_url: audioUrl,
    reuse_status: "existing_inventory",
    duplicate_policy: "do_not_remint"
  };

  if (type === "KK") {
    candidates.push(item);
  } else if (type === "mK") {
    item.admin_override_required = true;
    adminMkCandidates.push(item);
  }
}

candidates.sort((a, b) => (a.start_seconds ?? 999999) - (b.start_seconds ?? 999999));
adminMkCandidates.sort((a, b) => (a.start_seconds ?? 999999) - (b.start_seconds ?? 999999));

const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const path = registry.ii_delivery_paths.find(
  (p) => p.ii_id === "ii-kupid-valentine-your-touch-intimate-bold"
);

if (!path) {
  console.error("Missing II path in registry.");
  process.exit(1);
}

path.kk_candidates = candidates;
path.admin_only_mk_candidates = adminMkCandidates;
path.status = candidates.length > 0 ? "seeded_existing_kk_inventory" : "needs_review_no_kk_found";
path.inventory_counts = {
  kk_candidates: candidates.length,
  admin_only_mk_candidates: adminMkCandidates.length
};
path.updated_at = new Date().toISOString();

fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2) + "\n");

console.log("K-UPID Valentine reuse registry populated.");
console.log("KK candidates:", candidates.length);
console.log("ADMIN-only mK candidates:", adminMkCandidates.length);
console.log("Registry:", registryPath);
