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
  const browse = read("app/browse/page.tsx");

  if (lock.schema_version !== "STRICT_MUSIC_EMERGENCY_HOLD_V001") {
    throw new Error("hold schema drift");
  }
  if (lock.status !== "STOP_THE_LINE") {
    throw new Error("stop-the-line status removed");
  }
  if (lock.absolute_law?.every_II_must_contain_authorized_music !== true) {
    throw new Error("authorized music law missing");
  }
  if (lock.absolute_law?.every_II_must_have_LT_PIX_SSOT_parent !== true) {
    throw new Error("LT-PIX SSOT parent law missing");
  }
  if (lock.absolute_law?.LT_PIX_parent_must_be_strict_music_proven !== true) {
    throw new Error("LT-PIX strict music proof law missing");
  }
  if (lock.absolute_law?.known_or_suspected_MC_BOT_allowed_public !== 0) {
    throw new Error("MC-BOT public allowance must remain zero");
  }
  if (lock.absolute_law?.no_music_audio_allowed_public !== 0) {
    throw new Error("no-music public allowance must remain zero");
  }

  for (const required of [
    'status: HOLD_STATUS',
    'inventoryCount: 0',
    'purchasableCount: 0',
    'records: []',
    '"X-KKUT-Strict-Music-Hold": "active"',
    '"Cache-Control": "no-store, max-age=0"',
  ]) {
    requireText(catalog, required, "catalog hold");
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

  const publicCopy = `${kkutHome}\n${sentimeantHome}\n${browse}`;
  for (const forbidden of [
    "Live now · 2,611",
    "2,611 verified choices",
    "Browse 2,611 KK HUGs",
    "Browse all 2,611",
  ]) {
    if (publicCopy.includes(forbidden)) {
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
    requireText(publicCopy, required, "public hold copy");
  }

  console.log("STRICT MUSIC EMERGENCY HOLD AUDIT PASS");
  console.log("PUBLIC AUDIO: 0");
  console.log("PURCHASABLE IIS: 0");
  console.log("CHECKOUT: BLOCKED");
  console.log("MC-BOT / NO-MUSIC ALLOWED: 0");
  console.log("LT-PIX SSOT PARENT REQUIRED: YES");
  console.log("AUTHORIZED MUSIC REQUIRED: YES");
} catch (error) {
  console.error("STRICT MUSIC EMERGENCY HOLD AUDIT FAIL");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
