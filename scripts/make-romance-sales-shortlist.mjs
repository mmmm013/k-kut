import fs from "node:fs";

const routerPath = "data/ii-delivery-registry/romance-router.json";
const outJson = "reports/ii-candidates/romance-sales-shortlist.public.json";
const outMd = "reports/ii-candidates/romance-sales-shortlist.public.md";

if (!fs.existsSync(routerPath)) {
  console.error("Missing router:", routerPath);
  process.exit(1);
}

const router = JSON.parse(fs.readFileSync(routerPath, "utf8"));

function publicClean(label) {
  return String(label || "")
    .replace(/^\s*-\s*/g, "")
    .replace(/\bLloyd G Miller\b/gi, "")
    .replace(/\bMusic Maykers\b/gi, "")
    .replace(/\bLT-PIX\b/gi, "")
    .replace(/\s+-\s+/g, " - ")
    .replace(/^\s*-\s*/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

const routePickOrder = [
  "love-sweet",
  "love-deep-devotion",
  "kupid-physical-spark",
  "wedding-forever",
  "anniversary-still-choosing-you",
  "repair-still-love-you"
];

const forbiddenPublic = [
  "Music Maykers",
  "LT-PIX",
  "mK",
  "mini",
  "instro",
  "instrumental",
  "Lloyd G Miller"
];

const picks = [];

for (const routeId of routePickOrder) {
  const route = router.routes.find((r) => r.route_id === routeId);
  if (!route) continue;

  const kk = (route.kk_candidates || []).find((c) => c.type === "KK");
  if (!kk) continue;

  const publicLabel = publicClean(kk.public_label || route.buyer_label);
  const hay = `${route.buyer_label} ${publicLabel}`;

  if (forbiddenPublic.some((term) => hay.toLowerCase().includes(term.toLowerCase()))) {
    continue;
  }

  picks.push({
    ii_id: `ii-romance-${route.route_id}-${kk.id}`,
    route_id: route.route_id,
    buyer_label: route.buyer_label,
    buyer_question: route.buyer_question,
    public_label: publicLabel,
    kk_id: kk.id,
    start_seconds: kk.start_seconds,
    end_seconds: kk.end_seconds,
    checkout_url: route.checkout_url,
    reuse_policy: "reuse_existing_kk",
    duplicate_policy: "do_not_remint",
    public_inventory_type: "K-KUT / HUG Moment",
    delivery_status: "needs_bookend_twinkle_materialization",
    delivery_requirements: {
      front_padding_required: true,
      back_padding_required: true,
      twinkle_required: true
    }
  });
}

const report = {
  report: "romance-sales-shortlist-public",
  status: picks.length ? "ready_for_admin_audio_review" : "blocked_no_public_picks",
  doctrine: [
    "Public UI shows simple buyer feelings, not internal source labels.",
    "KK only in public shortlist.",
    "mKs are ADMIN override only.",
    "No INSTRO.",
    "No duplicate II.",
    "Raw KK audio is not customer delivery; materialize padding + Twinkle first."
  ],
  picks
};

fs.writeFileSync(outJson, JSON.stringify(report, null, 2) + "\n");

let md = "# Romance Sales Shortlist\n\n";
md += `Status: ${report.status}\n\n`;
md += "Rules: KK only. No mKs. No INSTRO. No internal labels. No duplicate II. Delivery needs padding + Twinkle.\n\n";

for (const p of picks) {
  md += `- ${p.buyer_label} | ${p.public_label} | ${p.start_seconds}-${p.end_seconds}s | kk=${p.kk_id}\n`;
}

fs.writeFileSync(outMd, md);

console.log("Romance public sales shortlist created.");
console.log("Picks:", picks.length);
console.log("JSON:", outJson);
console.log("MD:", outMd);
