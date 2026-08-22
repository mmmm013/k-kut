import fs from "node:fs";
import path from "node:path";

const roots = ["app", "components", "lib", "data", "manifests"];
const walk = (root) => fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
  const full = path.join(root, entry.name);
  return entry.isDirectory() ? walk(full) : [full];
});
const files = roots.flatMap(walk).filter((file) => /\.(?:ts|tsx|js|mjs|json)$/u.test(file));
const stop = (message) => { throw new Error(message); };

for (const file of files) {
  const text = fs.readFileSync(file, "utf8");
  if (text.includes("https://buy.stripe.com/")) stop("embedded Stripe URL remains in " + file);
  if (/\$(?:11\.99|12\.99|14\.99)/u.test(text)) stop("obsolete display price remains in " + file);
}

const offerLaw = fs.readFileSync("lib/productOfferLaw.ts", "utf8");
for (const required of [
  'priceCents: 799',
  'priceCents: 499',
  'priceCents: 199',
  'totalTimedSends: 3',
  'deliveryModes: ["REPEAT", "STORY_ARC"]',
  'sameExactBugEachSend: true',
  'distinctBugEachSend: true',
  'sequenceRoles: ["HOOK", "BUILD", "PAYOFF"]',
  'sequencingAddOnCents: 99',
  'totalPriceCents: 298',
  'packageLockedBeforeSendOne: true',
  'billingCount: 1',
]) if (!offerLaw.includes(required)) stop("offer law missing " + required);

const checkout = fs.readFileSync("app/checkout/route.ts", "utf8");
if (!checkout.includes("process.env.KK_HUG_PAYMENT_URL")) stop("central HUG gate missing");
if (!checkout.includes("process.env.SK_TUG_PAYMENT_URL")) stop("central TUG gate missing");
if (!checkout.includes("const paymentUrl = config.paymentUrl")) stop("per-record payment link still used");

const personal = fs.readFileSync("app/personal/page.tsx", "utf8");
if (!personal.includes("featuredPromos") || !personal.includes("Promo universe")) stop("Promo lane removed");
if (!fs.existsSync("app/holiday/page.tsx")) stop("Holiday lane removed");

const lock = JSON.parse(fs.readFileSync("config/kkr-canonical-product-price-lock.v2.json", "utf8"));
if (JSON.stringify(lock.prices_cents) !== JSON.stringify({ HUG: 799, TUG: 499, BUG: 199 })) stop("V002 prices drifted");
if (lock.addons_cents.STORY_BUG_SEQUENCING !== 99) stop("Story BUG add-on price drifted");
if (lock.package_totals_cents.REPEAT_BUG !== 199 || lock.package_totals_cents.STORY_BUG !== 298) stop("BUG package totals drifted");
if (lock.delivery_law.BUG_TOTAL_TIMED_SENDS !== 3) stop("BUG send count drifted");
if (JSON.stringify(lock.delivery_law.BUG_DELIVERY_MODES) !== JSON.stringify(["REPEAT", "STORY_ARC"])) stop("BUG modes drifted");
if (lock.delivery_law.REPEAT_BUG_SAME_EXACT_BUG_EACH_SEND !== true) stop("Repeat BUG law drifted");
if (lock.delivery_law.STORY_BUG_DISTINCT_BUG_EACH_SEND !== true) stop("Story BUG distinctness drifted");
if (JSON.stringify(lock.delivery_law.STORY_BUG_SEQUENCE_ROLES) !== JSON.stringify(["HOOK", "BUILD", "PAYOFF"])) stop("Story BUG sequence drifted");
if (lock.delivery_law.STORY_BUG_SEQUENCING_ADDON_CENTS !== 99) stop("Story BUG add-on drifted");
if (lock.delivery_law.STORY_BUG_TOTAL_CENTS !== 298) stop("Story BUG total drifted");
if (lock.delivery_law.BUG_PACKAGE_LOCKED_BEFORE_SEND_ONE !== true) stop("BUG package lock drifted");
if (lock.delivery_law.BUG_BILLING_COUNT !== 1) stop("BUG billing law drifted");

console.log("RUNTIME PRICE / PAYMENT CLEANUP AUDIT PASS");
console.log("HUG $7.99 · TUG $4.99 · BUG $1.99");
console.log("BUG REPEAT: SAME EXACT BUG · 3 TIMED SENDS · $1.99");
console.log("BUG STORY: 3 RELATED BUGS · HOOK/BUILD/PAYOFF · $2.98");
console.log("EMBEDDED PAYMENT LINKS: 0");
console.log("HOLIDAY: KEPT");
console.log("PROMO: KEPT");
