import fs from "node:fs";

const inventoryPath = "reports/kk-inventory/k_kuts.auto.csv";
const outJson = "reports/ii-candidates/kupid-heart-poundin-candidates.json";
const outMd = "reports/ii-candidates/kupid-heart-poundin-candidates.md";

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

const forbiddenForCustomer = [
  "instro",
  "instrumental",
  "christmas",
  "xmas",
  "mother's day",
  "mothers day",
  "father's day",
  "fathers day"
];

function hasAny(text, terms) {
  const t = String(text || "").toLowerCase();
  return terms.some((term) => t.includes(term));
}

const titleTerms = [
  "heart poundin",
  "heart pounding",
  "your heart poundin",
  "your heart pounding",
  "nkd",
  "naked"
];

const lines = fs.readFileSync(inventoryPath, "utf8").split(/\r?\n/).filter(Boolean);

const kkCandidates = [];
const adminOnlyMkCandidates = [];
const seen = new Set();

for (const line of lines) {
  const lower = line.toLowerCase();

  if (!hasAny(lower, titleTerms)) continue;
  if (hasAny(lower, forbiddenForCustomer)) continue;

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
    public_label: cleanPublicLabel(title),
    source_id: sourceId,
    internal_title: title,
    internal_source_file: sourceFile,
    start_seconds: Number.isFinite(start) ? start : null,
    end_seconds: Number.isFinite(end) ? end : null,
    duration_seconds: Number.isFinite(start) && Number.isFinite(end) ? Math.max(0, end - start) : null,
    method,
    audio_url: audioUrl,
    product_family: "K-UPID",
    intent: "intimate-bold",
    buyer_display_feeling: "Physical Spark / Desire",
    reuse_status: "existing_pre_made_inventory",
    duplicate_policy: "do_not_remint"
  };

  if (type === "KK") {
    kkCandidates.push(item);
  } else if (type === "mK") {
    item.admin_override_required = true;
    adminOnlyMkCandidates.push(item);
  }
}

kkCandidates.sort((a, b) => (a.start_seconds ?? 999999) - (b.start_seconds ?? 999999));
adminOnlyMkCandidates.sort((a, b) => (a.start_seconds ?? 999999) - (b.start_seconds ?? 999999));

const report = {
  report: "kupid-heart-poundin-candidates",
  status: kkCandidates.length ? "ready_for_admin_audio_review" : "blocked_no_kk_found",
  doctrine: [
    "Heart Poundin and NKD/Naked versions belong in K-UPID / adult-romance routing, not Mother/Hope.",
    "KK candidates may be reviewed for buyer flow.",
    "mK candidates are ADMIN override only.",
    "Do not create duplicate II.",
    "No INSTRO.",
    "No public Music Maykers display.",
    "Delivery audio requires front padding, back padding, and Twinkle."
  ],
  payment_links: {
    kupid_valentine_reuse: "https://buy.stripe.com/5kQ8wO206bYKcy88Nw4ow0k",
    admin_override_mk_only: "https://buy.stripe.com/9B6eVcawC7Iu1Tu2p84ow0w"
  },
  kk_candidates: kkCandidates,
  admin_only_mk_candidates: adminOnlyMkCandidates
};

fs.writeFileSync(outJson, JSON.stringify(report, null, 2) + "\n");

let md = "# K-UPID Heart Poundin Candidates\n\n";
md += `Status: ${report.status}\n\n`;
md += "Route: K-UPID / Physical Spark / Desire. Not Mother/Hope.\n\n";
md += "Rules: KK review first. mKs ADMIN override only. No duplicate II. No INSTRO. No public internal source labels.\n\n";

md += "## KK Candidates\n\n";
for (const c of kkCandidates.slice(0, 40)) {
  md += `- ${c.start_seconds}-${c.end_seconds}s | ${c.public_label} | kk=${c.id}\n`;
}

md += "\n## ADMIN-only mK Candidates\n\n";
for (const c of adminOnlyMkCandidates.slice(0, 40)) {
  md += `- ${c.start_seconds}-${c.end_seconds}s | ${c.public_label} | mk=${c.id}\n`;
}

fs.writeFileSync(outMd, md);

console.log("K-UPID Heart Poundin candidate report created.");
console.log("KK candidates:", kkCandidates.length);
console.log("ADMIN-only mK candidates:", adminOnlyMkCandidates.length);
console.log("JSON:", outJson);
console.log("MD:", outMd);
