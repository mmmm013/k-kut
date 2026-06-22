import fs from "node:fs";

const themeRx = /(FD2026|Father'?s Day KK|Wedding KK|Christmas KK|Birthday KK|holiday[-_ ]?kk|fathers?-day|mothers?-day|christmas|wedding|birthday|anniversary|holiday)/i;

const activeContainerManifest = "data/kk-sets/fathers-day-product-statements.json";
const neutralInventory = "data/kut-inventory/neutral-kut-inventory.json";
const publicPage = "app/fathers-day/page.tsx";

const failures = [];

function fail(msg) {
  failures.push(msg);
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

const container = readJson(activeContainerManifest);
const items = container.items || container.products || [];

items.forEach((item, idx) => {
  const label = `container item ${idx + 1}`;

  for (const field of ["id", "audioInventoryId", "iiId", "kkId", "kutId", "audioUrl", "publicDisplayCode"]) {
    const value = item[field];
    if (value && themeRx.test(String(value))) {
      fail(`${activeContainerManifest}: ${label}: forbidden theme/calendar term in ${field}: ${value}`);
    }
  }

  for (const forbiddenField of ["publicTitle", "productTitle", "title", "internalTitle", "legacyAudioUrl", "publicAudioUrl", "localReviewFile"]) {
    if (item[forbiddenField]) {
      fail(`${activeContainerManifest}: ${label}: forbidden identity/display field remains: ${forbiddenField}`);
    }
  }

  if (!/^SLOT-\d{3}$/.test(item.id || "")) {
    fail(`${activeContainerManifest}: ${label}: id must be neutral SLOT-###, got ${item.id}`);
  }

  if (!/^KK\d+$/.test(item.publicDisplayCode || "")) {
    fail(`${activeContainerManifest}: ${label}: publicDisplayCode must be KK#, got ${item.publicDisplayCode}`);
  }

  if (!/^II-[A-F0-9]{12}$/.test(item.iiId || "")) {
    fail(`${activeContainerManifest}: ${label}: iiId must be neutral II-XXXXXXXXXXXX, got ${item.iiId}`);
  }

  if (!/^KK-[A-F0-9]{12}$/.test(item.kkId || "")) {
    fail(`${activeContainerManifest}: ${label}: kkId must be neutral KK-XXXXXXXXXXXX, got ${item.kkId}`);
  }

  if (!/^KUT-[A-F0-9]{12}$/.test(item.kutId || "")) {
    fail(`${activeContainerManifest}: ${label}: kutId must be neutral KUT-XXXXXXXXXXXX, got ${item.kutId}`);
  }

  if (!String(item.audioUrl || "").startsWith("/kuts/inventory/")) {
    fail(`${activeContainerManifest}: ${label}: audioUrl must use neutral /kuts/inventory/ path, got ${item.audioUrl}`);
  }
});

const inv = readJson(neutralInventory);
for (const item of inv.items || []) {
  for (const field of ["audioInventoryId", "iiId", "kkId", "kutId", "canonicalAudioUrl", "canonicalAudioFile"]) {
    const value = item[field];
    if (value && themeRx.test(String(value))) {
      fail(`${neutralInventory}: ${item.kutId || "unknown"}: forbidden theme/calendar term in canonical field ${field}: ${value}`);
    }
  }

  if (!String(item.canonicalAudioUrl || "").startsWith("/kuts/inventory/")) {
    fail(`${neutralInventory}: ${item.kutId}: canonicalAudioUrl must use /kuts/inventory/`);
  }
}

const page = fs.readFileSync(publicPage, "utf8");

if (!/<h3>\{publicCode\}<\/h3>/.test(page)) {
  fail(`${publicPage}: public card heading must use publicCode only`);
}

if (/<h3>\{title\}<\/h3>/.test(page)) {
  fail(`${publicPage}: public card heading still uses title`);
}

if (/\{item\.feelingLane/.test(page)) {
  fail(`${publicPage}: public page must not expose feelingLane as card identity`);
}

if (/publicTitle|productTitle/.test(page)) {
  fail(`${publicPage}: public page must not depend on product/public titles for card display`);
}

if (failures.length) {
  console.error("THEME CONTAINER / AUDIO IDENTITY AUDIT: FAIL");
  for (const f of failures) console.error(f);
  process.exit(1);
}

console.log("THEME CONTAINER / AUDIO IDENTITY AUDIT: PASS");
console.log("Theme context remains navigation/container only; active audio identity is neutral II/KK/KUT inventory.");
