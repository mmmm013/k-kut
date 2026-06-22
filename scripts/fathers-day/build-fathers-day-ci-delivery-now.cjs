const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

const scanRoots = [
  "public",
  "data",
  "reports"
].map(p => path.join(ROOT, p)).filter(fs.existsSync);

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if ([".git", ".next", "node_modules"].includes(ent.name)) continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const files = scanRoots.flatMap(d => walk(d));
const audio = files.filter(f => /\.(mp3|wav|m4a|aiff|aif)$/i.test(f));

function relPublic(abs) {
  if (abs.startsWith(path.join(ROOT, "public"))) {
    return "/" + path.relative(path.join(ROOT, "public"), abs).replaceAll(path.sep, "/");
  }
  return path.relative(ROOT, abs).replaceAll(path.sep, "/");
}

function findAudio(pred) {
  return audio
    .filter(f => pred(f.toLowerCase()))
    .map(f => ({
      abs: f,
      public_path: relPublic(f),
      filename: path.basename(f)
    }));
}

const ringTheBell = findAudio(s =>
  s.includes("ring-the-bell") &&
  (s.includes("ii-delivery") || s.includes("canonical-sti") || s.includes("approved") || s.includes("keep"))
);

const thankYou = findAudio(s =>
  s.includes("thank") &&
  s.includes("you") &&
  (s.includes("ii") || s.includes("delivery") || s.includes("hug") || s.includes("mothers") || s.includes("signature") === false)
);

const lifeTest = findAudio(s =>
  s.includes("life") &&
  s.includes("test")
);

const youAndMe = findAudio(s =>
  (s.includes("you-and-me") || s.includes("you and me") || s.includes("you_me")) ||
  (s.includes("chris") && s.includes("krause"))
);

const haveTo = findAudio(s =>
  s.includes("have") &&
  s.includes("to")
);

const noMystery = findAudio(s =>
  s.includes("no-mystery") || s.includes("no mystery")
);

const ciDefs = [
  {
    ci_id: "FD-CI-001",
    display_title: "You Earned This — Father's Day CI",
    dad_praise: "Respect earned. Showing up. Accomplishment.",
    preferred_sources: ["Ring the Bell"],
    candidates: ringTheBell
  },
  {
    ci_id: "FD-CI-002",
    display_title: "Keep Going Dad — Father's Day CI",
    dad_praise: "Courage. Resilience. Grit.",
    preferred_sources: ["Life's a Test", "Ring the Bell"],
    candidates: [...lifeTest, ...ringTheBell]
  },
  {
    ci_id: "FD-CI-003",
    display_title: "Strong Quiet Dad — Father's Day CI",
    dad_praise: "Quiet love. Strength. Appreciation.",
    preferred_sources: ["Thank You", "Ring the Bell"],
    candidates: [...thankYou, ...ringTheBell]
  },
  {
    ci_id: "FD-CI-004",
    display_title: "Family First Dad — Father's Day CI",
    dad_praise: "Family. Loyalty. Togetherness.",
    preferred_sources: ["You and Me", "Thank You"],
    candidates: [...youAndMe, ...thankYou]
  },
  {
    ci_id: "FD-CI-005",
    display_title: "Work Boots Dad — Father's Day CI",
    dad_praise: "Duty. Sacrifice. Did what had to be done.",
    preferred_sources: ["That's a Have To", "Life's a Test", "Ring the Bell"],
    candidates: [...haveTo, ...lifeTest, ...ringTheBell]
  },
  {
    ci_id: "FD-CI-006",
    display_title: "Old-School Western Dad — Father's Day CI",
    dad_praise: "Cowboy. Western. Rustic. Weathered but true.",
    preferred_sources: ["Life's a Test", "You and Me", "Ring the Bell"],
    candidates: [...lifeTest, ...youAndMe, ...ringTheBell]
  },
  {
    ci_id: "FD-CI-007",
    display_title: "Clear and Steady Dad — Father's Day CI",
    dad_praise: "Clarity. Steady truth. No drama.",
    preferred_sources: ["No Mystery", "Thank You"],
    candidates: [...noMystery, ...thankYou]
  }
];

const staged = ciDefs.map(ci => ({
  ci_id: ci.ci_id,
  display_title: ci.display_title,
  lane: "fathers-day",
  object_type: "CI",
  dad_praise: ci.dad_praise,
  preferred_sources: ci.preferred_sources,
  selected_audio_path: ci.candidates[0]?.public_path || null,
  selected_audio_filename: ci.candidates[0]?.filename || null,
  candidate_count: ci.candidates.length,
  candidates: ci.candidates.slice(0, 12).map(c => c.public_path),
  status: ci.candidates.length ? "AUDIO_ATTACHED_NEEDS_GREGORY_REVIEW" : "NO_AUDIO_ATTACHED_YET",
  title_rule: "Holiday is lane only. PIX titles remain exact track titles. Display title is CI wrapper."
}));

const record = {
  status: "FATHERS_DAY_CI_DELIVERY_BUILT_NOW",
  created_at: new Date().toISOString(),
  lane: "fathers-day",
  hard_rules: [
    "Holiday is a lane.",
    "PIX title is not changed.",
    "Thank You remains a PIX / track title, not a holiday title.",
    "CI selection is by theme, KK metadata, MetaGrab tags, and buyer feeling.",
    "Use available approved IIs/KKs tonight."
  ],
  dad_praise_lanes: [
    "showing up",
    "strength under pressure",
    "steady protection",
    "work and sacrifice",
    "teaching by example",
    "loyalty and family",
    "quiet love",
    "courage and keep going",
    "respect earned",
    "legacy"
  ],
  audio_inventory_counts: {
    ring_the_bell: ringTheBell.length,
    thank_you: thankYou.length,
    lifes_a_test: lifeTest.length,
    you_and_me_chris_krause: youAndMe.length,
    have_to: haveTo.length,
    no_mystery: noMystery.length
  },
  cis: staged
};

fs.writeFileSync(
  "data/fathers-day/ci/fathers-day-ci-delivery-now-v001.json",
  JSON.stringify(record, null, 2)
);

let md = `# Father's Day CI Delivery Now — v001\n\n`;
md += `Holiday is a lane. PIX titles remain exact track titles. CI display titles are wrappers only.\n\n`;
md += `## Audio Inventory Counts\n\n`;
for (const [k, v] of Object.entries(record.audio_inventory_counts)) {
  md += `- ${k}: ${v}\n`;
}
md += `\n## CI Options\n\n`;
for (const ci of staged) {
  md += `### ${ci.ci_id} — ${ci.display_title}\n`;
  md += `- Praise: ${ci.dad_praise}\n`;
  md += `- Status: ${ci.status}\n`;
  md += `- Selected audio: ${ci.selected_audio_path || "NONE"}\n`;
  md += `- Candidate count: ${ci.candidate_count}\n\n`;
}

fs.writeFileSync(
  "reports/fathers-day/fathers-day-ci-delivery-now-v001.md",
  md
);

console.log("FATHER'S DAY CI DELIVERY BUILD COMPLETE");
console.log("ring_the_bell:", ringTheBell.length);
console.log("thank_you:", thankYou.length);
console.log("lifes_a_test:", lifeTest.length);
console.log("you_and_me_chris_krause:", youAndMe.length);
console.log("have_to:", haveTo.length);
console.log("no_mystery:", noMystery.length);
console.log("ci_total:", staged.length);
console.log("ci_audio_attached:", staged.filter(c => c.selected_audio_path).length);
console.log("json: data/fathers-day/ci/fathers-day-ci-delivery-now-v001.json");
console.log("md: reports/fathers-day/fathers-day-ci-delivery-now-v001.md");
