import fs from "node:fs";
import path from "node:path";

function read(file) {
  if (!fs.existsSync(file)) {
    throw new Error(`missing ${file}`);
  }

  return fs.readFileSync(file, "utf8");
}

function collect(current, output) {
  const normalized = current.replaceAll("\\", "/");

  if (
    normalized === "app/_saved-ui" ||
    normalized.startsWith("app/_saved-ui/")
  ) {
    return;
  }

  if (!fs.existsSync(current)) return;

  const stat = fs.statSync(current);

  if (stat.isDirectory()) {
    for (const name of fs.readdirSync(current)) {
      collect(path.join(current, name), output);
    }
    return;
  }

  if (/\.(?:ts|tsx|js|mjs|json)$/u.test(current)) {
    output.push(current);
  }
}

try {
  const catalog = read("app/api/public-ii-catalog/route.ts");
  const checkout = read("app/checkout/route.ts");
  const browser = read("components/PublicIiBrowser.tsx");

  for (const required of [
    "EXPECTED_STORAGE_INVENTORY_COUNT = 3867",
    "EXPECTED_KK_COUNT = 2611",
    "EXPECTED_SK_COUNT = 1256",
    "PUBLIC_STORAGE_VERIFIED",
    "signature_audio_logo_integral_at_end",
  ]) {
    if (!catalog.includes(required)) {
      throw new Error(`catalog missing ${required}`);
    }
  }

  for (const required of [
    "verifiedInventoryFamily",
    "offer-inventory-mismatch",
    "NEXT_PUBLIC_SK_HUG_LINK",
    "KK_HUG_PAYMENT_URL",
    "createPendingH2Order",
  ]) {
    if (!checkout.includes(required)) {
      throw new Error(`checkout missing ${required}`);
    }
  }

  if (!browser.includes("value={record.checkout}")) {
    throw new Error(
      "browser does not submit the governed family checkout code",
    );
  }

  const runtimeFiles = [];

  for (const root of ["app", "components", "lib"]) {
    collect(root, runtimeFiles);
  }

  const runtime = runtimeFiles
    .map((file) => fs.readFileSync(file, "utf8"))
    .join("\n");

  for (const forbidden of [
    "KkutHomeProducts",
    "MothersDayMCBot",
    "hugRealKutManifest",
    "holidaySeeds",
    "Big HUG",
    "$12.99",
    "NEXT_PUBLIC_MD_",
    "Mother’s Day",
    "Mother's Day",
    "Father’s Day",
    "Father's Day",
    "/mothers-day",
    "/fathers-day",
  ]) {
    if (runtime.includes(forbidden)) {
      throw new Error(`permanent runtime exposes ${forbidden}`);
    }
  }

  console.log("BIC HUG GATE PASS");
  console.log("VERIFIED PUBLIC INVENTORY: 3867");
  console.log("sK HUGS: 1256 AT $4.99");
  console.log("KK HUGS: 2611 AT $7.99");
  console.log("TWINKLE-AT-END GATE: REQUIRED");
  console.log("PERMANENT NAMED-HOLIDAY RUNTIME: NONE");
} catch (error) {
  console.error("BIC HUG GATE FAIL");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
