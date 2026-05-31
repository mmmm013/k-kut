import fs from "node:fs";

const sensoryPath = "data/gpmc-sensory/sensory-emotional-records.generated.json";
const inventoryPath = "reports/system-map/k-kut-inventory-reality.json";
const outputPath = "data/gpmc-sensory/sensory-expansion-queue.json";

const sensory = JSON.parse(fs.readFileSync(sensoryPath, "utf8"));
const inventory = fs.existsSync(inventoryPath)
  ? JSON.parse(fs.readFileSync(inventoryPath, "utf8"))
  : null;

const currentApprovedPublicSeedCount = Array.isArray(sensory.records)
  ? sensory.records.length
  : 0;

const queue = {
  status: "active_expansion_queue",
  name: "GPMC Sensory-Emotional Expansion Queue",
  current_approved_public_seed_count: currentApprovedPublicSeedCount,
  critical_warning:
    "The current sensory record count is only the approved-public seed. It is not the full GPM PIX catalog, not the full K-KUT inventory, and not the emotional-sensory ceiling.",
  expansion_law:
    "Expand from reviewed source material into sensory-emotional records before public buyer exposure. Never expose raw inventory directly.",
  doctrine_law:
    "Slice as thinly as the emotional meaning remains complete. Do not slice thinner than human meaning.",
  inventory_reality_reference: inventory
    ? {
        scanned_files: inventory.scanned_files ?? null,
        json_files: inventory.json_files ?? null,
        audio_files_found_in_repo_tree:
          inventory.audio_files_found_in_repo_tree ?? null,
        pix_mentions: inventory.pix_mentions ?? null,
        kk_mentions: inventory.kk_mentions ?? null,
        ii_mentions: inventory.ii_mentions ?? null
      }
    : {
        note: "Inventory reality report not found in this checkout."
      },
  expansion_lanes: [
    {
      lane_id: "thank_you_gratitude",
      priority: 1,
      purpose: "Gratitude, appreciation, care, thanks, and gentle recognition.",
      source_strategy: "Use proven Thank You fixture only after preserving current working paths.",
      public_risk: "low_to_medium",
      review_requirement: "Confirm each slice is gratitude-safe and not Mother’s-Day-only.",
      target_record_count_first_pass: 12
    },
    {
      lane_id: "birthday_lift",
      priority: 2,
      purpose: "Birthday warmth, joy, confidence, celebration, and personal spark.",
      source_strategy: "Find approved lift/spark/fun KKs that are not romance-dependent.",
      public_risk: "low",
      review_requirement: "Avoid over-intense romance or age-inappropriate wording.",
      target_record_count_first_pass: 12
    },
    {
      lane_id: "encouragement_strength",
      priority: 3,
      purpose: "Support, courage, resilience, belief, and keep-going energy.",
      source_strategy: "Search for strength, test, keep going, carry through, showing the way.",
      public_risk: "medium",
      review_requirement: "Avoid diagnosing hardship or promising outcomes.",
      target_record_count_first_pass: 16
    },
    {
      lane_id: "friendship_seen",
      priority: 4,
      purpose: "Friendship, being seen, listening, shared history, and everyday care.",
      source_strategy: "Search for friend, always listening, shared care, warm presence.",
      public_risk: "low_to_medium",
      review_requirement: "Avoid accidentally romantic phrasing unless route is romance.",
      target_record_count_first_pass: 12
    },
    {
      lane_id: "missing_you_memory",
      priority: 5,
      purpose: "Missing someone, distance, memory, tender ache, and returning carefully.",
      source_strategy: "Search for longing, distance, remember, come back, still here.",
      public_risk: "medium",
      review_requirement: "Separate romance-missing-you from grief-missing-you.",
      target_record_count_first_pass: 12
    },
    {
      lane_id: "apology_repair",
      priority: 6,
      purpose: "Repair, humility, still care, soft return, and non-coercive apology.",
      source_strategy: "Build from current apology approved record outward.",
      public_risk: "high",
      review_requirement: "No pressure to forgive. No manipulation. No guaranteed repair.",
      target_record_count_first_pass: 10
    },
    {
      lane_id: "anniversary_devotion",
      priority: 7,
      purpose: "Still choosing, devotion, continuity, shared time, and tender commitment.",
      source_strategy: "Build from current anniversary approved record outward.",
      public_risk: "medium",
      review_requirement: "Romantic context must be clear. Avoid coercive forever claims.",
      target_record_count_first_pass: 10
    },
    {
      lane_id: "grief_held",
      priority: 8,
      purpose: "Grief-safe presence, remembrance, no-fixing care, and quiet witness.",
      source_strategy: "Hold until stricter human review; do not auto-publish.",
      public_risk: "highest",
      review_requirement: "Human review required. No romance, spark, or celebration leakage.",
      target_record_count_first_pass: 0,
      public_status: "held"
    }
  ],
  required_next_actions: [
    "Create candidate extraction scripts for reviewed PIX/KK/KUT/II records.",
    "Generate internal sensory candidates with good_use_cases, bad_use_cases, risk_notes, and do_not_say.",
    "Human-review candidates before approved_public status.",
    "Only approved_public records may flow to buyer routes.",
    "Keep per-user caring history opt-in and non-manipulative."
  ]
};

fs.writeFileSync(outputPath, JSON.stringify(queue, null, 2) + "\n");

console.log("WROTE", outputPath);
console.log("CURRENT APPROVED-PUBLIC SEED:", currentApprovedPublicSeedCount);
console.log("EXPANSION LANES:", queue.expansion_lanes.length);
