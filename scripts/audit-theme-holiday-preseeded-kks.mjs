import fs from "node:fs";

const inventoryPath = "reports/kk-inventory/k_kuts.auto.csv";
const outJson = "reports/ii-candidates/theme-holiday-preseeded-kks-audit.json";
const outMd = "reports/ii-candidates/theme-holiday-preseeded-kks-audit.md";

if (!fs.existsSync(inventoryPath)) {
  console.error("Missing inventory:", inventoryPath);
  process.exit(1);
}

const ROUTES = [
  {
    route_id: "mother-thanks",
    buyer_label: "Mother / Thanks",
    terms: ["mother", "mom", "mum", "mama", "thank", "thanks", "gratitude"]
  },
  {
    route_id: "hope-comfort",
    buyer_label: "Hope / Comfort",
    terms: ["hope", "comfort", "carry", "shelter", "guide", "light"]
  },
  {
    route_id: "sweet-love",
    buyer_label: "Sweet Love",
    terms: ["a love like that", "sweet love", "love"]
  },
  {
    route_id: "physical-spark",
    buyer_label: "Physical Spark",
    terms: ["heart poundin", "heart pounding", "your touch", "naked", "nkd"]
  },
  {
    route_id: "repair-still-love-you",
    buyer_label: "Repair / Still Love You",
    terms: ["don't call it love", "dont call it love", "sorry", "repair", "still love"]
  },
  {
    route_id: "wedding-forever",
    buyer_label: "Wedding / Forever",
    terms: ["forever and a day", "forever", "wedding", "first dance"]
  },
  {
    route_id: "anniversary",
    buyer_label: "Anniversary",
    terms: ["anniversary", "still choose", "forever", "love like that"]
  },
  {
    route_id: "birthday",
    buyer_label: "Birthday",
    terms: ["birthday", "best birthday"]
  },
  {
    route_id: "christmas-warmth",
    buyer_label: "Christmas Warmth",
    terms: ["christmas", "xmas"]
  },
  {
    route_id: "new-year-fresh-start",
    buyer_label: "New Year / Fresh Start",
    terms: ["new year", "fresh start", "start again"]
  },
  {
    route_id: "father-support",
    buyer_label: "Father / Support",
    terms: ["father", "dad", "papa", "support"]
  },
  {
    route_id: "missing-you",
    buyer_label: "Missing You",
    terms: ["missing you", "miss you", "where's my friend", "come back", "absence"]
  }
];

const forbidden = [
  "instro",
  "instrumental",
  "no vocal",
  "no vocals",
  "bed only",
  "music bed"
];

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

function hasAny(text, terms) {
  const t = String(text || "").toLowerCase();
  return terms.some((term) => t.includes(term.toLowerCase()));
}

const lines = fs.readFileSync(inventoryPath, "utf8").split(/\r?\n/).filter(Boolean);

const results = [];

for (const route of ROUTES) {
  const kk = [];
  const adminOnlyMk = [];
  const seen = new Set();

  for (const line of lines) {
    const lower = line.toLowerCase();

    if (hasAny(lower, forbidden)) continue;
    if (!hasAny(lower, route.terms)) continue;

    const cols = parseCsvLine(line);
    const id = cols[0] || "";
    const title = cols[1] || "";
    const type = cols[2] || "";
    const sourceFile = cols[4] || "";
    const start = Number(cols[9] || 0);
    const end = Number(cols[10] || 0);

    if (!id || seen.has(id)) continue;
    seen.add(id);

    const item = {
      id,
      type,
      public_label: cleanPublicLabel(title),
      start_seconds: Number.isFinite(start) ? start : null,
      end_seconds: Number.isFinite(end) ? end : null,
      source_public_label: cleanPublicLabel(sourceFile),
      reuse_policy: "existing_pre_made_inventory",
      duplicate_policy: "do_not_remint"
    };

    if (type === "KK") kk.push(item);
    if (type === "mK") {
      item.admin_override_required = true;
      adminOnlyMk.push(item);
    }
  }

  results.push({
    route_id: route.route_id,
    buyer_label: route.buyer_label,
    status: kk.length ? "preseeded_with_existing_kks" : "blocked_needs_seed_review",
    kk_count: kk.length,
    admin_only_mk_count: adminOnlyMk.length,
    sample_kk_candidates: kk.slice(0, 12),
    sample_admin_only_mk_candidates: adminOnlyMk.slice(0, 6)
  });
}

const report = {
  report: "theme-holiday-preseeded-kks-audit",
  law: [
    "All themes and holidays must be seeded with pre-made KKs first.",
    "Do not create duplicate II.",
    "No raw KK customer delivery.",
    "Padding and Twinkle travel together.",
    "No INSTRO.",
    "mKs are ADMIN override only.",
    "No internal labels on public UI."
  ],
  inventory_path: inventoryPath,
  routes: results
};

fs.writeFileSync(outJson, JSON.stringify(report, null, 2) + "\n");

let md = "# Theme / Holiday Pre-Seeded KK Audit\n\n";
md += "Law: every theme and holiday must seed from existing pre-made KKs first.\n\n";

for (const r of results) {
  md += `## ${r.buyer_label} (${r.route_id})\n\n`;
  md += `Status: ${r.status}\n\n`;
  md += `KK candidates: ${r.kk_count}\n\n`;
  md += `ADMIN-only mK candidates: ${r.admin_only_mk_count}\n\n`;

  for (const c of r.sample_kk_candidates) {
    md += `- ${c.start_seconds}-${c.end_seconds}s | ${c.public_label} | kk=${c.id}\n`;
  }

  md += "\n";
}

fs.writeFileSync(outMd, md);

console.log("Theme/Holiday pre-seeded KK audit complete.");
console.log("JSON:", outJson);
console.log("MD:", outMd);

for (const r of results) {
  console.log(`${r.route_id}: KK=${r.kk_count} | admin-mK=${r.admin_only_mk_count} | ${r.status}`);
}
