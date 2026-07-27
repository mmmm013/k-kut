import fs from "node:fs";

function read(path) {
  if (!fs.existsSync(path)) throw new Error(`missing ${path}`);
  return fs.readFileSync(path, "utf8");
}

function requireText(text, value, label) {
  if (!text.includes(value)) throw new Error(`${label} missing ${value}`);
}

try {
  const lock = JSON.parse(read("config/strict-music-emergency-hold.v1.json"));
  const catalog = read("app/api/public-ii-catalog/route.ts");
  const checkout = read("app/checkout/route.ts");
  const kkutHome = read("app/_kkut-home.tsx");
  const sentimeantHome = read("app/_sentimeant-home.tsx");
  const storyRoute = read("app/sentimeant/[slug]/page.tsx");
  const middleware = read("middleware.ts");
  const browse = read("app/browse/page.tsx");

  if (lock.schema_version !== "STRICT_MUSIC_EMERGENCY_HOLD_V001") {
    throw new Error("hold schema drift");
  }
  if (lock.status !== "STOP_THE_LINE") {
    throw new Error("stop-the-line status removed");
  }

  const laws = lock.absolute_law || {};
  for (const [field, expected] of [
    ["every_II_must_contain_authorized_music", true],
    ["every_II_must_have_LT_PIX_SSOT_parent", true],
    ["LT_PIX_parent_must_be_strict_music_proven", true],
    ["known_or_suspected_MC_BOT_allowed_public", 0],
    ["no_music_audio_allowed_public", 0],
    ["theme_assignment_requires_dressed_semantic_authority", true],
    ["positional_zip_assignment_allowed", false],
    ["unsupported_semantic_assignment_allowed_public", 0],
    ["individual_GD_theme_review_required", true],
  ]) {
    if (laws[field] !== expected) {
      throw new Error(`absolute law failed: ${field}`);
    }
  }

  for (const required of [
    "status: HOLD_STATUS",
    "inventoryCount: 0",
    "purchasableCount: 0",
    "records: []",
    '"X-KKUT-Strict-Music-Hold": "active"',
    '"Cache-Control": "no-store, max-age=0"',
  ]) {
    requireText(catalog, required, "general catalog hold");
  }

  for (const forbidden of [
    "buy.stripe.com",
    "createPendingH2Order",
    "KK_HUG_PAYMENT_URL",
    "NEXT_PUBLIC_SK_HUG_LINK",
  ]) {
    if (checkout.includes(forbidden)) {
      throw new Error(`checkout still exposes ${forbidden}`);
    }
  }
  requireText(checkout, '"strict-music-emergency-hold"', "checkout hold");

  const heldCopy = `${kkutHome}\n${browse}`;
  for (const forbidden of [
    "Live now · 2,611",
    "2,611 verified choices",
    "Browse 2,611 KK HUGs",
    "Browse all 2,611",
  ]) {
    if (heldCopy.includes(forbidden)) {
      throw new Error(`false public availability claim remains: ${forbidden}`);
    }
  }

  for (const required of [
    "LT-PIX SSOT",
    "authorized music",
    "MC-BOT",
    "Public audio: 0",
    "Purchasable IIs: 0",
  ]) {
    requireText(heldCopy, required, "K-KUT hold copy");
  }

  for (const required of [
    "Semantic match hold",
    "Public story audio: 0",
    "dressed LT-PIX",
    "meaning, mood, feeling, sentiment",
    "individually reviewed semantic match",
  ]) {
    requireText(sentimeantHome, required, "Sentimeant semantic hold");
  }

  if (sentimeantHome.includes("<CuteHugCarousel")) {
    throw new Error("Sentimeant carousel remains public during semantic hold");
  }
  if (storyRoute.includes("<audio") || storyRoute.includes("story.audioUrl")) {
    throw new Error("direct Sentimeant story audio remains public");
  }
  requireText(storyRoute, "Audio blocked", "direct story hold");

  for (const required of [
    'SENTIMEANT_EVIDENCE_AUDIO_PREFIX = "/sentimeant/strict-kk-v001/"',
    "status: 410",
    '"X-Sentimeant-Semantic-Hold": "active"',
    '"/sentimeant/:path*"',
  ]) {
    requireText(middleware, required, "Sentimeant path block");
  }

  const evidence = lock.temporary_curated_release || {};
  if (evidence.status !== "ISOLATED_AS_SEMANTIC_MISMATCH_EVIDENCE") {
    throw new Error("13-file semantic evidence status missing");
  }
  if (evidence.evidence_files_preserved !== true) {
    throw new Error("13-file evidence preservation missing");
  }
  if (evidence.public_story_access !== false || evidence.public_audio_access !== false) {
    throw new Error("13-file public access must remain false");
  }
  if (evidence.GD_reviews_completed !== 0) {
    throw new Error("unreviewed themes cannot be represented as reviewed");
  }

  console.log("STRICT MUSIC + SEMANTIC CONTROL AUDIT PASS");
  console.log("GENERAL PUBLIC CATALOG AUDIO: 0");
  console.log("SENTIMEANT PUBLIC STORY AUDIO: 0");
  console.log("PURCHASABLE IIS: 0");
  console.log("CHECKOUT: BLOCKED");
  console.log("MC-BOT / NO-MUSIC ALLOWED: 0");
  console.log("POSITIONAL THEME ASSIGNMENT ALLOWED: NO");
  console.log("DRESSED SEMANTIC AUTHORITY REQUIRED: YES");
  console.log("INDIVIDUAL GD THEME REVIEWS REQUIRED: 13");
} catch (error) {
  console.error("STRICT MUSIC + SEMANTIC CONTROL AUDIT FAIL");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
