import fs from "node:fs";

const emotionsPath = "data/emotions/top-100-shared-emotions.json";
const candidatesPath = "data/intent-candidates/sympathy/action-candidates.json";
const outPath = "data/intent-candidates/sympathy/action-candidates.json";
const reportPath = "data/intent-candidates/sympathy/shared-emotion-map-report.md";

const emotions = JSON.parse(fs.readFileSync(emotionsPath, "utf8"));
const candidatePayload = JSON.parse(fs.readFileSync(candidatesPath, "utf8"));

const validEmotionIds = new Set((emotions.emotions || []).map((row) => row.emotion_id));

function hasEmotion(id) {
  return validEmotionIds.has(id);
}

function clean(ids) {
  return [...new Set(ids)].filter(hasEmotion);
}

function mapRow(row) {
  const action = row.action_verb || "";
  const object = row.action_object || "";
  const evidence = [
    action,
    object,
    ...(row.object_evidence_terms || []),
    ...(row.positive_evidence_terms || []),
    ...(row.positive_directions || []),
    ...(row.common_use_situations || [])
  ].join(" ").toLowerCase();

  const ids = [];

  if (action === "carry" || object === "dark_days" || evidence.includes("dark")) {
    ids.push("being_carried", "comfort_after_loss", "support", "resilience");
  }

  if (action === "endure" || evidence.includes("remain") || evidence.includes("through")) {
    ids.push("continuing_love", "resilience", "patience", "support");
  }

  if (action === "walk_beside" || object === "hard_road" || evidence.includes("beside")) {
    ids.push("walking_beside", "support", "quiet_presence", "loyalty");
  }

  if (action === "sit_with" || evidence.includes("listening") || object === "someone_grieving") {
    ids.push("quiet_presence", "being_heard", "comfort_after_loss", "supporting_friend");
  }

  if (action === "shelter" || object === "wind_and_rain" || evidence.includes("shelter")) {
    ids.push("sheltered_from_hurt", "protection", "comfort_after_loss", "support");
  }

  if (action === "remember" || object === "what_remains" || evidence.includes("remain")) {
    ids.push("remembering_a_life", "continuing_bond", "legacy", "missing_someone");
  }

  if (action === "honor") {
    ids.push("gratitude_for_life", "remembering_a_life", "legacy", "commemoration");
  }

  if (action === "release") {
    ids.push("gentle_goodbye", "letting_go", "closure", "acceptance");
  }

  const sharedEmotionIds = clean(ids);

  return {
    ...row,
    shared_emotion_ids: sharedEmotionIds,
    shared_emotion_map_status:
      sharedEmotionIds.length > 0 ? "mapped_candidate_review_required" : "unmapped_reprocess",
    buyer_lane_candidates: sharedEmotionIds.includes("comfort_after_loss") ||
      sharedEmotionIds.includes("remembering_a_life") ||
      sharedEmotionIds.includes("continuing_bond")
        ? ["sympathy", "grief", "memorial"]
        : ["support"],
    publication_allowed: false,
    payment_allowed: false,
    human_approved: false
  };
}

const rows = candidatePayload.rows || [];

if (rows.length < 1) {
  console.error("STOP: Sympathy action candidate rows are zero. Restore the 11-row set before mapping.");
  process.exit(1);
}

const mappedRows = rows.map(mapRow);

const unmapped = mappedRows.filter((row) => !row.shared_emotion_ids || row.shared_emotion_ids.length < 1);

if (unmapped.length > 0) {
  console.error(`STOP: ${unmapped.length} rows did not map to shared emotions.`);
  for (const row of unmapped) {
    console.error(`${row.id}: ${row.action_verb} + ${row.action_object}`);
  }
  process.exit(1);
}

candidatePayload.rows = mappedRows;
candidatePayload.shared_emotion_mapping = {
  status: "mapped_candidate_review_required",
  source: emotionsPath,
  rule: "Shared emotion mappings are candidate mappings only. They do not approve publication or payment."
};

fs.writeFileSync(outPath, JSON.stringify(candidatePayload, null, 2) + "\n");

let md = "# Sympathy Action Candidate Shared Emotion Map\n\n";
md += "Status: candidate mapping only. Non-public. Non-payable.\n\n";
md += "| # | Action | Object | Shared Emotions | Buyer Lane Candidates | Backend Label |\n";
md += "|---:|---|---|---|---|---|\n";

mappedRows.forEach((row, index) => {
  md += `| ${index + 1} | ${row.action_verb} | ${row.action_object} | ${row.shared_emotion_ids.join(", ")} | ${(row.buyer_lane_candidates || []).join(", ")} | ${String(row.title_backend_label || "").replaceAll("|", "/")} |\n`;
});

fs.writeFileSync(reportPath, md);

console.log(`MAPPED ROWS ${mappedRows.length}`);
console.log(`WROTE ${outPath}`);
console.log(`WROTE ${reportPath}`);
