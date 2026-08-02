import fs from "node:fs";

const routerPath = "data/ii-delivery-registry/romance-router.json";
const inventoryPath = "reports/kk-inventory/k_kuts.auto.csv";
const reportMd = "reports/ii-candidates/romance-router-population.md";
const reportJson = "reports/ii-candidates/romance-router-population.json";

if (!fs.existsSync(routerPath)) {
  console.error("Missing router:", routerPath);
  process.exit(1);
}

if (!fs.existsSync(inventoryPath)) {
  console.error("Missing inventory:", inventoryPath);
  process.exit(1);
}

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

function normalize(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanPublicLabel(s) {
  return String(s || "")
    .replace(/^\s*\d+\s*-\s*/g, "")
    .replace(/\bMusic Maykers\b/gi, "")
    .replace(/\bLT-PIX\b/gi, "")
    .replace(/\.mp3$/gi, "")
    .replace(/\.wav$/gi, "")
    .replace(/\s+—\s+KK\s+\d+$/i, "")
    .replace(/\s+—\s+mK\s+[\d.]+$/i, "")
    .replace(/\s+-\s+/g, " - ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

const forbiddenCustomerTerms = [
  "instro",
  "instrumental",
  "instrumentals",
  "no vocal",
  "no vocals",
  "bed only",
  "music bed",
  "christmas",
  "xmas",
  "mothers day",
  "mother's day",
  "fathers day",
  "father's day"
];

const heldSourceIds = new Set([
  "6e959ac6-9546-4bae-87b2-ed6584185682",
  "ii-romance-reuse-6e959ac6-9546-4bae-87b2-ed6584185682"
]);
const heldTitles = new Set(["dont call it love"]);
const heldRouteIds = new Set(["repair-still-love-you"]);

function hasForbiddenCustomerTerm(text) {
  const t = normalize(text);
  return forbiddenCustomerTerms.some((term) => t.includes(normalize(term)));
}

function isHeldSource({ id, title, sourceId, sourceFile }) {
  const normalizedTitle = normalize(`${title} ${sourceFile}`);
  return (
    heldSourceIds.has(id) ||
    heldSourceIds.has(sourceId) ||
    [...heldTitles].some((heldTitle) => normalizedTitle.includes(heldTitle))
  );
}

function seedMatches(lineText, seedTitle) {
  const hay = normalize(lineText);
  const seed = normalize(seedTitle);

  if (!seed) return false;
  if (heldTitles.has(seed)) return false;
  if (hay.includes(seed)) return true;

  if (seed === "heart poundin") {
    return hay.includes("heart poundin") || hay.includes("heart pounding") || hay.includes("your heart poundin") || hay.includes("your heart pounding");
  }

  if (seed === "your heart poundin") {
    return hay.includes("your heart poundin") || hay.includes("your heart pounding");
  }

  if (seed === "your touch") return hay.includes("your touch");
  if (seed === "nkd") return hay.includes("nkd");
  if (seed === "naked") return hay.includes("naked");
  if (seed === "a love like that") return hay.includes("a love like that");
  if (seed === "forever and a day") return hay.includes("forever and a day");
  return false;
}

const lines = fs.readFileSync(inventoryPath, "utf8").split(/\r?\n/).filter(Boolean);
const router = JSON.parse(fs.readFileSync(routerPath, "utf8"));

if (!Array.isArray(router.routes)) {
  throw new Error("ROMANCE ROUTER ROUTES ARE MISSING");
}

const allRows = [];
let heldRowsExcluded = 0;

for (const line of lines) {
  if (hasForbiddenCustomerTerm(line)) continue;

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

  if (!id || !["KK", "mK"].includes(type)) continue;

  if (isHeldSource({ id, title, sourceId, sourceFile })) {
    heldRowsExcluded++;
    continue;
  }

  allRows.push({
    id,
    type,
    title,
    source_id: sourceId,
    source_file: sourceFile,
    start_seconds: Number.isFinite(start) ? start : null,
    end_seconds: Number.isFinite(end) ? end : null,
    duration_seconds: Number.isFinite(start) && Number.isFinite(end) ? Math.max(0, end - start) : null,
    method,
    audio_url: audioUrl,
    raw_line: line
  });
}

for (const route of router.routes) {
  if (heldRouteIds.has(route.route_id)) {
    route.kk_candidates = [];
    route.admin_only_mk_candidates = [];
    route.inventory_counts = { kk_candidates: 0, admin_only_mk_candidates: 0 };
    route.status = "held_failed_route_song_blk_nblk_reprocessing_required";
    route.updated_at = new Date().toISOString();
    continue;
  }

  const seeds = (route.seed_titles || []).filter(
    (seed) => !heldTitles.has(normalize(seed)),
  );
  const kk = [];
  const mk = [];
  const seen = new Set();

  for (const row of allRows) {
    const lineText = `${row.title} ${row.source_file} ${row.raw_line}`;
    const matchedSeed = seeds.find((seed) => seedMatches(lineText, seed));

    if (!matchedSeed) continue;
    if (seen.has(row.id)) continue;
    seen.add(row.id);

    const item = {
      id: row.id,
      type: row.type,
      matched_seed: matchedSeed,
      public_label: cleanPublicLabel(row.title),
      start_seconds: row.start_seconds,
      end_seconds: row.end_seconds,
      duration_seconds: row.duration_seconds,
      reuse_status: "existing_pre_made_inventory",
      duplicate_policy: "do_not_remint",
      delivery_status: "needs_bookend_twinkle_materialization",
      internal_proof: {
        source_id: row.source_id,
        internal_title: row.title,
        internal_source_file: row.source_file,
        method: row.method,
        audio_url: row.audio_url
      }
    };

    if (row.type === "KK") {
      kk.push(item);
    } else {
      item.admin_override_required = true;
      mk.push(item);
    }
  }

  kk.sort((a, b) => String(a.matched_seed).localeCompare(String(b.matched_seed)) || (a.start_seconds ?? 999999) - (b.start_seconds ?? 999999));
  mk.sort((a, b) => String(a.matched_seed).localeCompare(String(b.matched_seed)) || (a.start_seconds ?? 999999) - (b.start_seconds ?? 999999));

  route.kk_candidates = kk;
  route.admin_only_mk_candidates = mk;
  route.inventory_counts = {
    kk_candidates: kk.length,
    admin_only_mk_candidates: mk.length
  };
  route.status = kk.length > 0 ? "populated_existing_kk_inventory" : "blocked_no_kk_candidates_found";
  route.updated_at = new Date().toISOString();
}

const serializedRoutes = JSON.stringify(router.routes);
if (
  serializedRoutes.includes("6e959ac6-9546-4bae-87b2-ed6584185682") ||
  normalize(serializedRoutes).includes("dont call it love")
) {
  throw new Error("HELD DON'T CALL IT LOVE SOURCE REENTERED ROMANCE ROUTER");
}

router.status = "populated_from_existing_inventory_with_song_holds";
router.held_route_ids = [...heldRouteIds];
router.held_source_ids = [...heldSourceIds];
router.updated_at = new Date().toISOString();

fs.writeFileSync(routerPath, JSON.stringify(router, null, 2) + "\n");

const summary = {
  report: "romance-router-population",
  router: routerPath,
  inventory: inventoryPath,
  status: router.status,
  held_rows_excluded: heldRowsExcluded,
  held_route_ids: [...heldRouteIds],
  routes: router.routes.map((route) => ({
    route_id: route.route_id,
    buyer_label: route.buyer_label,
    status: route.status,
    seed_titles: route.seed_titles,
    kk_candidates: route.kk_candidates.length,
    admin_only_mk_candidates: route.admin_only_mk_candidates.length
  }))
};

fs.writeFileSync(reportJson, JSON.stringify(summary, null, 2) + "\n");

let md = "# Romance Router Population Report\n\n";
md += `Status: ${router.status}\n\n`;
md += "Rules applied: existing inventory only; KK first; mKs ADMIN override only; no INSTRO; no duplicate II; delivery still needs padding + Twinkle; held source identities and failed routes stay out.\n\n";

for (const route of router.routes) {
  md += `## ${route.buyer_label} (${route.route_id})\n\n`;
  md += `Status: ${route.status}\n\n`;
  md += `Seeds: ${(route.seed_titles || []).join(", ") || "none"}\n\n`;
  md += `KK candidates: ${route.kk_candidates.length}\n\n`;

  for (const candidate of route.kk_candidates.slice(0, 12)) {
    md += `- ${candidate.start_seconds}-${candidate.end_seconds}s | ${candidate.public_label} | kk=${candidate.id} | seed=${candidate.matched_seed}\n`;
  }

  if (route.kk_candidates.length > 12) {
    md += `- ... ${route.kk_candidates.length - 12} more KK candidates\n`;
  }

  md += `\nADMIN-only mK candidates: ${route.admin_only_mk_candidates.length}\n\n`;
  for (const candidate of route.admin_only_mk_candidates.slice(0, 8)) {
    md += `- ${candidate.start_seconds}-${candidate.end_seconds}s | ${candidate.public_label} | mk=${candidate.id} | seed=${candidate.matched_seed}\n`;
  }

  if (route.admin_only_mk_candidates.length > 8) {
    md += `- ... ${route.admin_only_mk_candidates.length - 8} more ADMIN-only mK candidates\n`;
  }

  md += "\n";
}

fs.writeFileSync(reportMd, md);

console.log("Romance router populated.");
console.log("HELD SOURCE ROWS EXCLUDED:", heldRowsExcluded);
console.log("HELD ROUTE: repair-still-love-you");
console.log("Router:", routerPath);
console.log("Report JSON:", reportJson);
console.log("Report MD:", reportMd);
for (const route of router.routes) {
  console.log(`${route.route_id}: KK=${route.kk_candidates.length} | admin-mK=${route.admin_only_mk_candidates.length} | ${route.status}`);
}
