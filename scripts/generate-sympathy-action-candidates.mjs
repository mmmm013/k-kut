import fs from "node:fs";
import path from "node:path";

const outDir = "data/intent-candidates/sympathy";
const outJson = `${outDir}/action-candidates.json`;
const outMd = `${outDir}/action-candidate-report.md`;

fs.mkdirSync(outDir, { recursive: true });

const sourceFiles = [
  "reports/kkr-linefeels/human-expression-linefeel-candidates.md",
  "reports/kkr-linefeels/kk-objectified-ii-ci-review.md",
  "reports/kkr-linefeels/human-expression-linefeel-dispositions.md",
  "reports/title-blind-kut-konotation-packet.md",
  "reports/title-blind-kut-review-outcomes.md",
  "reports/kk-derivation-inventory-from-active-lt-pix.md"
].filter((f) => fs.existsSync(f));

const rule = JSON.parse(fs.readFileSync("data/4pe/rules/kkr-action-intent-rules.json", "utf8"));
const radiationMap = JSON.parse(fs.readFileSync("data/4pe/rules/kkr-emotional-radiation-map.json", "utf8"));
const sympathyRadiation = radiationMap.sympathy || {};

const actionPatterns = [
  {
    action_verb: "comfort",
    required: ["comfort", "support"],
    context: ["grief", "loss", "dark", "hard", "pain", "hurt", "cry", "alone", "beside"]
  },
  {
    action_verb: "remember",
    required: ["remember", "memory", "memorial", "remain"],
    context: ["love", "life", "days", "always", "gone", "near", "heart"]
  },
  {
    action_verb: "honor",
    required: ["honor", "thank", "gave", "giving", "chance", "life"],
    context: ["life", "way", "best", "today", "remain"]
  },
  {
    action_verb: "carry",
    required: ["carry", "through"],
    context: ["dark", "days", "valley", "mountain", "road", "beside"]
  },
  {
    action_verb: "shelter",
    required: ["shelter"],
    context: ["wind", "rain", "tree", "garden", "protect", "safe"]
  },
  {
    action_verb: "walk_beside",
    required: ["walk", "beside"],
    context: ["road", "lead", "there", "always", "no matter"]
  },
  {
    action_verb: "sit_with",
    required: ["listen", "listening"],
    context: ["say", "always", "friend", "matter", "there"]
  },
  {
    action_verb: "endure",
    required: ["remain", "through", "dark", "valley"],
    context: ["love", "always", "day", "night", "mountain"]
  }
];

function normalize(text) {
  return String(text || "")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .toLowerCase();
}

function splitParagraphs(text) {
  return text
    .split(/\n\s*\n/g)
    .map((p) => p.trim())
    .filter((p) => p.length > 40);
}

function hasAny(text, terms) {
  return terms.some((term) => text.includes(term));
}

function hitList(text, terms) {
  return terms.filter((term) => text.includes(term));
}

function hardExclusion(text) {
  return rule.hard_exclusions.filter((term) => {
    if (term === "mk") return /\bmk\b/i.test(text) || text.includes("— mk");
    return text.includes(term);
  });
}

function titleLooksExcluded(title) {
  const t = normalize(title);
  return hardExclusion(t).length > 0;
}

function getRadiationForVerb(actionVerb) {
  const normalized = String(actionVerb || "").replace(/_through$/, "").toLowerCase();

  if (sympathyRadiation.verbs?.[actionVerb]) return sympathyRadiation.verbs[actionVerb];
  if (sympathyRadiation.verbs?.[normalized]) return sympathyRadiation.verbs[normalized];

  if (actionVerb === "walk_beside") {
    return {
      positive_radiation: ["presence", "companionship", "support_on_the_road"],
      negative_radiation: ["romance_walk", "dependency", "possessive_presence"],
      common_use_situations: ["grief", "hard_road", "support_without_fixing"],
      forbidden_use_situations: ["romance", "wedding", "breakup_longing"],
      evidence_needs: ["walk_or_beside_evidence", "road_or_life_context", "non_romantic_frame"]
    };
  }

  if (actionVerb === "sit_with") {
    return {
      positive_radiation: ["listen", "stay_present", "make_less_alone"],
      negative_radiation: ["romantic_intimacy", "passive_pity", "dependency"],
      common_use_situations: ["grief", "loneliness", "quiet_support"],
      forbidden_use_situations: ["romance", "sexual_care", "breakup_longing"],
      evidence_needs: ["listening_evidence", "support_context", "non_romantic_frame"]
    };
  }

  return null;
}

function radiationRisk(rowText, radiation) {
  const risks = [];

  for (const term of radiation?.negative_radiation || []) {
    const phrase = String(term).replaceAll("_", " ");
    if (rowText.includes(phrase)) risks.push(`negative_radiation:${term}`);
  }

  for (const term of radiation?.forbidden_use_situations || []) {
    const phrase = String(term).replaceAll("_", " ");
    if (rowText.includes(phrase)) risks.push(`forbidden_situation:${term}`);
  }

  return risks;
}

function inferActionObject(actionVerb, rowText) {
  const objectMap = sympathyRadiation.sympathy_action_objects || {};
  const allowedObjects = objectMap[actionVerb] || [];
  const blockedObjects = sympathyRadiation.blocked_action_objects || [];

  const blockedHits = blockedObjects.filter((obj) => {
    const phrase = String(obj).replaceAll("_", " ");
    return rowText.includes(phrase);
  });

  if (blockedHits.length > 0) {
    return {
      action_object: "",
      object_evidence_terms: [],
      object_blockers: blockedHits
    };
  }

  const objectHits = allowedObjects.filter((obj) => {
    const phrase = String(obj).replaceAll("_", " ");
    return rowText.includes(phrase);
  });

  const fallbackObjects = [];

  if (rowText.includes("dark") || rowText.includes("dark days")) fallbackObjects.push("dark_days");
  if (rowText.includes("road")) fallbackObjects.push("hard_road");
  if (rowText.includes("wind") || rowText.includes("rain")) fallbackObjects.push("wind_and_rain");
  if (rowText.includes("life")) fallbackObjects.push("a_life");
  if (rowText.includes("remain") || rowText.includes("always")) fallbackObjects.push("what_remains");
  if (rowText.includes("beside")) fallbackObjects.push("someone");
  if (rowText.includes("listen") || rowText.includes("listening")) fallbackObjects.push("someone_grieving");
  if (rowText.includes("valley") || rowText.includes("mountain")) fallbackObjects.push("hard_road");

  const combined = [...new Set([...objectHits, ...fallbackObjects])];

  return {
    action_object: combined[0] || "",
    object_evidence_terms: combined,
    object_blockers: []
  };
}

function extractTitle(paragraph) {
  const lines = paragraph.split("\n").map((l) => l.trim()).filter(Boolean);
  const first = lines[0] || "";
  const titleMatch =
    first.match(/title[:|]\s*(.+)$/i) ||
    first.match(/\|\s*([^|]+)\s*\|/) ||
    first.match(/^[-#*\s]*([^:]{4,120})$/);
  return titleMatch ? titleMatch[1].trim() : first.slice(0, 120);
}

const candidates = [];
const seen = new Set();

for (const file of sourceFiles) {
  const raw = fs.readFileSync(file, "utf8");
  const paragraphs = splitParagraphs(raw);

  for (const paragraph of paragraphs) {
    const text = normalize(paragraph);
    const title = extractTitle(paragraph);

    const exclusions = hardExclusion(text);
    if (exclusions.length > 0) continue;
    if (titleLooksExcluded(title)) continue;

    for (const pattern of actionPatterns) {
      const requiredHits = hitList(text, pattern.required);
      const contextHits = hitList(text, pattern.context);

      // No one-term crapshoot: require at least one action hit AND one separate context hit.
      if (requiredHits.length < 1 || contextHits.length < 1) continue;

      // Paragraphical meaning required: candidate must have enough context.
      if (paragraph.length < 120) continue;

      const key = `${file}:${pattern.action_verb}:${title}:${paragraph.slice(0, 80)}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const radiation = getRadiationForVerb(pattern.action_verb);
      if (!radiation) continue;

      const objectResult = inferActionObject(pattern.action_verb, text);
      if (!objectResult.action_object) continue;

      const oppositeMeaningRisks = [
        ...radiationRisk(text, radiation),
        ...objectResult.object_blockers.map((blocker) => `blocked_object:${blocker}`)
      ];

      const pov_scores = {
        admin_intent: 1,
        song_meaning: requiredHits.length + contextHits.length >= 3 ? 2 : 1,
        section_context: paragraph.length >= 220 ? 2 : 1,
        recipient_risk: exclusions.length === 0 && oppositeMeaningRisks.length === 0 ? 2 : 0,
        buyer_promise: 1,
        payment_safety: 0,
        emotional_radiation: radiation.positive_radiation?.length > 0 && radiation.negative_radiation?.length > 0 ? 2 : 0
      };

      const total_score = Object.values(pov_scores).reduce((a, b) => a + b, 0);

      candidates.push({
        id: `sym_action_${String(candidates.length + 1).padStart(4, "0")}`,
        action_verb: pattern.action_verb,
        action_object: objectResult.action_object,
        object_evidence_terms: objectResult.object_evidence_terms,
        human_situation: "sympathy_grief_support_candidate",
        title_backend_label: title,
        source_file: file,
        source_section_or_paragraph: paragraph.slice(0, 1400),
        meaning_context: paragraph.slice(0, 500),
        positive_evidence_terms: [...new Set([...requiredHits, ...contextHits])],
        negative_evidence_terms: exclusions,
        positive_directions: radiation.positive_radiation || [],
        negative_directions: radiation.negative_radiation || [],
        common_use_situations: radiation.common_use_situations || [],
        forbidden_use_situations: radiation.forbidden_use_situations || [],
        evidence_needs: radiation.evidence_needs || [],
        opposite_meaning_risk: oppositeMeaningRisks,
        radiation_confidence:
          oppositeMeaningRisks.length === 0 && requiredHits.length >= 1 && contextHits.length >= 1
            ? "medium_review_required"
            : "low_reprocess",
        pov_scores,
        total_score,
        risk_flags: oppositeMeaningRisks,
        publication_allowed: false,
        payment_allowed: false,
        human_approved: false,
        sampling_status: oppositeMeaningRisks.length === 0 ? "HOLD" : "REPROCESS",
        sampling_notes: ""
      });
    }
  }
}

candidates.sort((a, b) => b.total_score - a.total_score);

const limited = candidates.slice(0, 100);

fs.writeFileSync(
  outJson,
  JSON.stringify(
    {
      status: "action_candidate_pool_generated_non_public",
      intent: "sympathy",
      publication_allowed: false,
      generated_at: new Date().toISOString(),
      source_files_scanned: sourceFiles,
      rule: "Action/verb candidate pool only. Candidate rows cannot publish or take payment.",
      rows: limited
    },
    null,
    2
  ) + "\n"
);

let md = "# Sympathy Action Candidate Report\n\n";
md += "Status: non-public, non-payable, verb/action candidate review only.\n\n";
md += `Candidates: ${limited.length}\n\n`;
md += "| # | Action | Object | Score | Radiation | Risk | Backend Label | Evidence | Source |\n";
md += "|---:|---|---|---:|---|---|---|---|---|\n";

limited.forEach((row, index) => {
  md += `| ${index + 1} | ${row.action_verb} | ${row.action_object || ""} | ${row.total_score} | ${(row.positive_directions || []).slice(0, 3).join(", ")} | ${(row.opposite_meaning_risk || []).join(", ") || "none"} | ${String(row.title_backend_label).replaceAll("|", "/")} | ${row.positive_evidence_terms.join(", ")} | ${path.basename(row.source_file)} |\n`;
});

fs.writeFileSync(outMd, md);

console.log(`WROTE ${outJson}`);
console.log(`WROTE ${outMd}`);
console.log(`ACTION CANDIDATES ${limited.length}`);
