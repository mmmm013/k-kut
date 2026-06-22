import fs from "node:fs";

const taxonomyPath = "data/product-taxonomy/k-kut-public-products-and-intents.json";
const taxonomy = JSON.parse(fs.readFileSync(taxonomyPath, "utf8"));
const failures = [];

function fail(msg) {
  failures.push(msg);
}

const bug = taxonomy.intentContainers?.BUG;

if (!bug) fail("BUG intent container missing.");

if (bug) {
  if (bug.shortKutOnly !== true) fail("BUG must be Short-KUT-only: shortKutOnly must be true.");
  if (bug.unitPriceCents !== 199) fail(`BUG unitPriceCents must be 199, got ${bug.unitPriceCents}.`);
  if (bug.currency !== "USD") fail(`BUG currency must be USD, got ${bug.currency}.`);
  if (bug.minRepeatCount !== 1) fail(`BUG minRepeatCount must be 1, got ${bug.minRepeatCount}.`);
  if (bug.maxRepeatCount !== 5) fail(`BUG maxRepeatCount must be 5, got ${bug.maxRepeatCount}.`);
  if (bug.forbidPublicRepeatCountsAbove !== 5) fail("BUG must forbid public repeat counts above 5.");
  if (bug.flatUnitPricing !== true) fail("BUG must use flat unit pricing.");
  if (bug.bundleDiscountsAllowedInPublicV1 !== false) fail("BUG public v1 must not use bundle discounts.");
  if (JSON.stringify(bug.allowPublicRepeatCounts) !== JSON.stringify([1, 2, 3, 4, 5])) {
    fail("BUG allowPublicRepeatCounts must be exactly [1,2,3,4,5].");
  }
  if (JSON.stringify(bug.allowedPublicProductFamilies) !== JSON.stringify(["Short-KUT"])) {
    fail("BUG allowedPublicProductFamilies must be exactly ['Short-KUT'].");
  }
}

const scanFiles = [
  "data/product-taxonomy/k-kut-public-products-and-intents.json",
  "data/kk-sets/fathers-day-product-statements.json",
  "data/kut-inventory/neutral-kut-inventory.json"
].filter((p) => fs.existsSync(p));

for (const file of scanFiles) {
  const text = fs.readFileSync(file, "utf8");

  if (/BUG[-_]KUT|BUG[-_]KK|BUG[-_]II/i.test(text)) {
    fail(`${file}: BUG must not appear as canonical audio identity.`);
  }

  const data = JSON.parse(text);
  const pools = [];
  if (Array.isArray(data.items)) pools.push(...data.items);
  if (Array.isArray(data.products)) pools.push(...data.products);

  for (const [i, item] of pools.entries()) {
    const label = `${file} item ${i + 1}`;
    const intent = item.intentContainer || item.containerIntent || item.selectionMetadata?.intentContainer || null;
    const family = item.productFamily || item.publicProductFamily || item.selectionMetadata?.productFamily || item.selectionMetadata?.publicProductFamily || null;
    const repeatCount = item.repeatCount || item.selectionMetadata?.repeatCount || null;
    const priceCents = item.priceCents || item.selectionMetadata?.priceCents || null;

    if (intent === "BUG") {
      if (family && family !== "Short-KUT") fail(`${label}: BUG can only use Short-KUT, got ${family}.`);
      if (repeatCount && (repeatCount < 1 || repeatCount > 5)) fail(`${label}: BUG repeatCount must be 1–5, got ${repeatCount}.`);
      if (priceCents && priceCents !== 199) fail(`${label}: BUG unit price must be 199 cents, got ${priceCents}.`);
    }
  }
}

if (failures.length) {
  console.error("BUG PRICING / REPEAT / SAFETY AUDIT: FAIL");
  for (const f of failures) console.error(f);
  process.exit(1);
}

console.log("BUG PRICING / REPEAT / SAFETY AUDIT: PASS");
console.log("BUGs are $1.99 each, repeatable 1–5 only, Short-KUT-only, and not audio identities.");
