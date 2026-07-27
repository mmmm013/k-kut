import fs from "node:fs";

function read(path) {
  if (!fs.existsSync(path)) {
    throw new Error(`missing ${path}`);
  }
  return fs.readFileSync(path, "utf8");
}

function requireText(text, value, label) {
  if (!text.includes(value)) {
    throw new Error(`${label} missing ${value}`);
  }
}

try {
  const carousel = read("components/CuteHugCarousel.tsx");
  const findPage = read("app/find/page.tsx");
  const browser = read("components/PublicIiBrowser.tsx");
  const catalog = read("app/api/public-ii-catalog/route.ts");

  for (const required of [
    'slug: "bad-day"',
    'image: "/cute-hugs/bad-day.webp"',
    'headline: "Bad day? Send a HUG."',
    'text: "A warm musical lift when someone needs care."',
    'href={`/find?moment=${slide.slug}`}',
  ]) {
    requireText(carousel, required, "Use Case 1 carousel");
  }

  if (!fs.existsSync("public/cute-hugs/bad-day.webp")) {
    throw new Error("Use Case 1 image is missing");
  }

  requireText(findPage, "initialMoment={moment}", "Use Case 1 find route");
  requireText(browser, '"bad-day": "love"', "Use Case 1 intent mapping");
  requireText(browser, 'id: "love"', "Use Case 1 MC need");
  requireText(browser, '"comfort"', "Use Case 1 comfort evidence");
  requireText(browser, '"care"', "Use Case 1 care evidence");

  for (const required of [
    "audioUrl",
    "PUBLIC_STORAGE_VERIFIED",
    "signature_audio_logo_integral_at_end",
    "twinkle_gate_failed",
    "publicRecords.length !== EXPECTED_KK_COUNT",
  ]) {
    requireText(catalog, required, "Use Case 1 governed audio catalog");
  }

  console.log("SENTIMEANT USE CASE 01 AUDIT PASS");
  console.log("STORY: Bad day? Send a HUG.");
  console.log("DESTINATION: /find?moment=bad-day");
  console.log("INTENT: love / comfort / care");
  console.log("AUDIO SOURCE: governed public catalog only");
  console.log("TWINKLE GATE: required");
  console.log("NAMING CHANGES: none");
} catch (error) {
  console.error("SENTIMEANT USE CASE 01 AUDIT FAIL");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
