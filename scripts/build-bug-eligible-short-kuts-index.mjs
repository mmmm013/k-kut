import fs from "node:fs";
import path from "node:path";

const inventoryPath = "data/kut-inventory/neutral-kut-inventory.json";
const taxonomyPath = "data/product-taxonomy/k-kut-public-products-and-intents.json";
const outPath = "data/kut-inventory/indexes/bug-eligible-short-kuts.json";

if (!fs.existsSync(inventoryPath)) {
  throw new Error(`Missing neutral KUT inventory: ${inventoryPath}`);
}

if (!fs.existsSync(taxonomyPath)) {
  throw new Error(`Missing public product taxonomy: ${taxonomyPath}`);
}

const inventory = JSON.parse(fs.readFileSync(inventoryPath, "utf8"));
const taxonomy = JSON.parse(fs.readFileSync(taxonomyPath, "utf8"));
const bugRule = taxonomy.intentContainers?.BUG;

if (!bugRule) throw new Error("BUG rule missing from taxonomy.");

function arr(x) {
  return Array.isArray(x) ? x : x ? [x] : [];
}

function hasAny(values, needles) {
  const joined = arr(values).map((v) => String(v).toLowerCase());
  return needles.some((n) => joined.includes(n.toLowerCase()));
}

function isBugEligibleShortKut(item) {
  const meta = item.selectionMetadata || {};
  const tags = [
    ...arr(item.tags),
    ...arr(meta.tags),
    ...arr(item.tone),
    ...arr(meta.tone),
    ...arr(item.intentTags),
    ...arr(meta.intentTags)
  ];

  const explicitBug =
    item.bugEligible === true ||
    meta.bugEligible === true ||
    hasAny(item.intentContainerAllowed, ["BUG"]) ||
    hasAny(meta.intentContainerAllowed, ["BUG"]) ||
    hasAny(item.allowedIntentContainers, ["BUG"]) ||
    hasAny(meta.allowedIntentContainers, ["BUG"]);

  const shortFamily =
    item.productFamily === "Short-KUT" ||
    item.publicProductFamily === "Short-KUT" ||
    meta.productFamily === "Short-KUT" ||
    meta.publicProductFamily === "Short-KUT";

  const tinyDuration =
    ["tiny", "short", "short-kut", "Short-KUT"].includes(item.durationClass) ||
    ["tiny", "short", "short-kut", "Short-KUT"].includes(meta.durationClass) ||
    ["tiny", "short", "short-kut", "Short-KUT"].includes(meta.maxDurationClass) ||
    ["tiny", "short", "short-kut", "Short-KUT"].includes(item.sizeClass) ||
    ["tiny", "short", "short-kut", "Short-KUT"].includes(meta.sizeClass);

  const goodTone = hasAny(tags, [
    "light",
    "brief",
    "affectionate",
    "reminder",
    "nudge",
    "call",
    "text",
    "remember",
    "love",
    "thinking-of-you",
    "check-in",
    "encouragement",
    "playful"
  ]);

  const forbiddenTone = hasAny(tags, [
    "pressure",
    "guilt",
    "harassment",
    "anger",
    "control",
    "surveillance",
    "threat",
    "coercion",
    "serious-repair",
    "grief"
  ]);

  return !forbiddenTone && (explicitBug || (shortFamily && tinyDuration) || (tinyDuration && goodTone));
}

function laneFor(item) {
  const meta = item.selectionMetadata || {};
  const text = JSON.stringify({ item, meta }).toLowerCase();

  if (/call|text|message|phone/.test(text)) return "CALL_TEXT";
  if (/love|miss|thinking/.test(text)) return "LOVE";
  if (/remember|forget|reminder/.test(text)) return "REMEMBER";
  if (/check|breathe|here|okay/.test(text)) return "CHECK_IN";
  if (/got this|keep going|proud|almost|encourage/.test(text)) return "ENCOURAGE";
  if (/poke|nudge|hey|playful|bug/.test(text)) return "PLAYFUL";

  return "GENERAL_LIGHT_NUDGE";
}

const items = [];

for (const item of inventory.items || []) {
  if (!isBugEligibleShortKut(item)) continue;

  const meta = item.selectionMetadata || {};
  const kutId = item.kutId;
  const iiId = item.iiId || item.audioInventoryId;
  const kkId = item.kkId;
  const canonicalAudioUrl = item.canonicalAudioUrl;

  if (!kutId || !canonicalAudioUrl) continue;

  items.push({
    bugIndexId: `BUGIDX-${kutId.replace(/^KUT-/, "")}`,
    intentContainer: "BUG",
    productFamily: "Short-KUT",
    displayProductFamily: "Short-KUT",
    kutId,
    iiId,
    kkId,
    canonicalAudioUrl,
    bugEligible: true,
    bugLane: laneFor(item),
    unitPriceCents: 199,
    currency: "USD",
    minRepeatCount: 1,
    maxRepeatCount: 5,
    allowedRepeatCounts: [1, 2, 3, 4, 5],
    repeatRequiresSchedule: true,
    deliveryScheduling: {
      defaultForRepeatedBugs: "scheduled_or_event_based",
      repeatCountRequiresSchedule: true,
      requiresExplicitTimingChoiceForRepeat: true,
      uncontrolledRandomDeliveryAllowed: false,
      randomByDefaultAllowed: false,
      surpriseWindowAllowed: true,
      surpriseWindowRequiresExplicitUserChoice: true,
      surpriseWindowIsControlledWindow: true,
      allowedScheduleModes: [
        "now_once",
        "later_once",
        "selected_dates",
        "daily_until_count_complete",
        "event_countdown",
        "event_reminder",
        "check_in_series",
        "surprise_window"
      ],
      forbiddenScheduleModes: [
        "uncontrolled_random",
        "random_by_default",
        "until_they_answer",
        "pester_loop"
      ]
    },
    safetyToneGate: {
      required: true,
      allowedTone: [
        "light",
        "brief",
        "affectionate",
        "non-demanding",
        "non-threatening",
        "non-manipulative",
        "easy to receive",
        "easy to ignore"
      ],
      forbiddenTone: bugRule.forbiddenTone || []
    },
    source: {
      neutralInventoryPath: inventoryPath,
      neutralInventoryRole: item.role || "neutral-kut-audio-inventory"
    }
  });
}

const out = {
  version: 1,
  role: "BUG eligible Short-KUT index",
  ownsAudio: false,
  audioIdentity: "neutral KUT inventory only",
  generatedAt: new Date().toISOString(),
  sourceInventory: inventoryPath,
  publicRules: {
    intentContainer: "BUG",
    productFamily: "Short-KUT",
    unitPriceCents: 199,
    currency: "USD",
    minRepeatCount: 1,
    maxRepeatCount: 5,
    repeatRequiresSchedule: true,
    uncontrolledRandomDeliveryAllowed: false,
    surpriseWindowAllowedOnlyWhenExplicit: true
  },
  inventoryCount: items.length,
  launchStatus: items.length >= 15 ? "launch-ready" : "needs-more-short-kuts",
  launchMinimumRecommended: 15,
  targetInventoryRecommended: 30,
  items
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + "\n");

console.log("BUG ELIGIBLE SHORT-KUT INDEX BUILT");
console.log(`Items: ${items.length}`);
console.log(`Launch status: ${out.launchStatus}`);
console.log(outPath);

if (items.length === 0) {
  console.log("NOTE: No BUG-ready Short-KUTs found yet. This is safe: the index exists, but launch requires adding/tagging tiny Short-KUT inventory.");
}
