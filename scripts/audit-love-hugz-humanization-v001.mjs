import fs from "node:fs";

const dataPath = "data/hugz/love-humanization-v001.json";
const componentPath = "components/LoveHumanizationReview.tsx";
const routePath = "app/hugz/love-review/page.tsx";

function fail(message) {
  throw new Error(message);
}

function read(filePath) {
  if (!fs.existsSync(filePath)) fail(`missing ${filePath}`);
  return fs.readFileSync(filePath, "utf8");
}

try {
  const model = JSON.parse(read(dataPath));
  const component = read(componentPath);
  const route = read(routePath);

  if (model.theme_anchor !== "LOVE") fail("theme anchor is not LOVE");
  if (model.status !== "ADMIN_REVIEW_ONLY") fail("LOVE model is not review-only");
  if (model.public_checkout_allowed !== false) fail("LOVE model permits public checkout");
  if (model.rules?.choices_per_set !== 3) fail("LOVE path does not require three choices");
  if (model.rules?.local_playback_volume_steps !== 8) fail("local playback volume is not in eighths");
  if (model.rules?.delivered_audio_gain_changes_allowed !== false) fail("delivered-audio gain changes are not held");
  if (model.rules?.unsupported_semantic_assignment_allowed !== false) fail("unsupported semantic assignment is not blocked");

  if (!Array.isArray(model.families) || model.families.length !== 10) {
    fail(`expected 10 LOVE families; found ${model.families?.length ?? 0}`);
  }

  const familyIds = new Set();
  let loveLevelCount = 0;

  for (const family of model.families) {
    if (!family.id || familyIds.has(family.id)) fail(`duplicate or missing LOVE family id ${family.id}`);
    familyIds.add(family.id);

    if (!Array.isArray(family.level_names) || family.level_names.length !== 10) {
      fail(`LOVE family ${family.id} does not contain exactly 10 levels`);
    }

    if (!Array.isArray(family.match_tokens) || family.match_tokens.length < 3) {
      fail(`LOVE family ${family.id} has insufficient matching depth`);
    }

    loveLevelCount += family.level_names.length;
  }

  if (loveLevelCount !== 100) fail(`expected 100 LOVE levels; found ${loveLevelCount}`);

  const triads = [
    ["direction", model.path_steps?.direction?.choices],
    ["scene-care", model.path_steps?.scene_by_direction?.care?.choices],
    ["scene-play", model.path_steps?.scene_by_direction?.play?.choices],
    ["scene-choose", model.path_steps?.scene_by_direction?.choose?.choices],
    ["tone", model.path_steps?.tone?.choices],
    ["intensity", model.path_steps?.intensity?.choices],
    ["directness", model.path_steps?.directness?.choices],
  ];

  for (const [name, choices] of triads) {
    if (!Array.isArray(choices) || choices.length !== 3) {
      fail(`${name} does not offer exactly three choices`);
    }

    const choiceIds = new Set(choices.map((choice) => choice.id));
    if (choiceIds.size !== 3) fail(`${name} contains duplicate choice ids`);
  }

  const allowedMgsDimensions = new Set(model.mgs_dimensions ?? []);
  const minimumMgsDimensions = model.rules?.minimum_mgs_dimensions_per_music_candidate ?? 3;

  for (const candidate of model.review_candidates ?? []) {
    if (candidate.public_checkout_allowed !== false) {
      fail(`review candidate ${candidate.candidate_id} permits checkout`);
    }

    const dimensions = new Set();
    for (const evidence of candidate.mgs_evidence ?? []) {
      if (!allowedMgsDimensions.has(evidence.dimension)) {
        fail(`candidate ${candidate.candidate_id} uses unknown MGS dimension ${evidence.dimension}`);
      }
      if (!Array.isArray(evidence.tags) || evidence.tags.length === 0) {
        fail(`candidate ${candidate.candidate_id} has empty MGS evidence for ${evidence.dimension}`);
      }
      dimensions.add(evidence.dimension);
    }

    if (dimensions.size < minimumMgsDimensions) {
      fail(`candidate ${candidate.candidate_id} has only ${dimensions.size} independent MGS dimensions`);
    }

    for (const familyId of candidate.supported_family_ids ?? []) {
      if (!familyIds.has(familyId)) {
        fail(`candidate ${candidate.candidate_id} references unknown LOVE family ${familyId}`);
      }
    }
  }

  for (const required of [
    "100 LOVE levels",
    "3 at a time",
    "3 MGS dimensions",
    "No public checkout",
    "Local listening volume",
    "does not alter source audio",
  ]) {
    if (!component.includes(required)) fail(`LOVE review component missing ${required}`);
  }

  for (const forbidden of [
    "buy.stripe.com",
    "Package this music as a HUG",
    "public_checkout_allowed: true",
  ]) {
    if (component.includes(forbidden) || route.includes(forbidden)) {
      fail(`LOVE review runtime exposes forbidden ${forbidden}`);
    }
  }

  if (!route.includes("robots") || !route.includes("index: false")) {
    fail("LOVE review route is not marked noindex");
  }

  console.log("LOVE HUGz HUMANIZATION AUDIT PASS");
  console.log("THEME ANCHOR: LOVE");
  console.log("LOVE FAMILIES: 10");
  console.log("LOVE LEVELS: 100");
  console.log("CHOICES PER SET: 3");
  console.log(`MINIMUM MGS DIMENSIONS: ${minimumMgsDimensions}`);
  console.log("LOCAL PLAYBACK VOLUME: 0/8 THROUGH 8/8");
  console.log("DELIVERED-AUDIO GAIN CHANGES: HELD");
  console.log("PUBLIC CHECKOUT: BLOCKED");
} catch (error) {
  console.error("LOVE HUGz HUMANIZATION AUDIT FAIL");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
