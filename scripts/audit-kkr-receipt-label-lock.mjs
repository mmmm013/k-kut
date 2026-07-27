import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const lockPath = path.join(
  root,
  "config",
  "kkr-canonical-receipt-label-lock.v3.json",
);
const displayPath = path.join(root, "lib", "customerDisplay.ts");
const receiptPreviewPath = path.join(
  root,
  "components",
  "BirthdayBicPanel.tsx",
);
const webhookPath = path.join(
  root,
  "app",
  "api",
  "stripe",
  "webhook",
  "route.ts",
);

function fail(message) {
  console.error(`KKR RECEIPT-LABEL LOCK FAIL: ${message}`);
  process.exit(1);
}

function read(file) {
  if (!fs.existsSync(file)) fail(`missing ${path.relative(root, file)}`);
  return fs.readFileSync(file, "utf8");
}

const lock = JSON.parse(read(lockPath));
const display = read(displayPath);
const receiptPreview = read(receiptPreviewPath);
const webhook = read(webhookPath);

if (lock.schema_version !== "KKR_CANONICAL_RECEIPT_LABEL_LOCK_V003") {
  fail("schema version changed");
}
if (lock.status !== "PERMANENT_CANONICAL_LAW") {
  fail("canonical status changed");
}
if (lock.receipt_label_law?.mKUT !== "MyK") {
  fail("mKUT receipt label must remain MyK");
}
if (lock.receipt_label_law?.sBLK !== "MyK") {
  fail("sBLK receipt label must remain MyK");
}
if (lock.receipt_label_law?.scope !== "customer_visible_receipt_only") {
  fail("MyK scope must remain receipt-only");
}
if (lock.receipt_label_law?.does_not_authorize_storefront_copy_change !== true) {
  fail("receipt law must not authorize storefront copy changes");
}
if (lock.structural_law?.mKUT_is_sBLK !== false) {
  fail("mKUT must not equal sBLK");
}
if (lock.proof_law?.webhook_health_is_not_naming_authority !== true) {
  fail("webhook health must not become naming authority");
}
if (
  lock.proof_law
    ?.historical_webhook_failure_is_not_current_failure_without_current_test !==
  true
) {
  fail("historical webhook failures must not be presented as current");
}

for (const required of [
  'const MYK_RECEIPT_TYPES = new Set(["mk", "mkut", "sk", "sblk"])',
  'receiptLabel === "MyK"',
  'publicItemCopy(type: InternalItemType | string)',
  'return customerFacingItemType(type)',
]) {
  if (!display.includes(required)) {
    fail(`receipt/display separation drift: ${required}`);
  }
}

for (const required of [
  "Receipt naming is separate from storefront wording.",
  "receipt label MyK",
]) {
  if (!receiptPreview.includes(required)) {
    fail(`receipt preview drift: ${required}`);
  }
}

if (!webhook.includes("export async function POST")) {
  fail("Stripe webhook POST route is missing from source");
}
if (webhook.includes("customerFacingReceiptLabel")) {
  fail("webhook must not determine receipt naming");
}

function collect(current, output) {
  if (!fs.existsSync(current)) return;
  const stat = fs.statSync(current);

  if (stat.isDirectory()) {
    for (const name of fs.readdirSync(current)) {
      collect(path.join(current, name), output);
    }
    return;
  }

  if (/\.(?:ts|tsx|js|mjs)$/u.test(current)) output.push(current);
}

const publicFiles = [];
collect(path.join(root, "app"), publicFiles);
collect(path.join(root, "components"), publicFiles);

const allowedMyKFiles = new Set([
  path.normalize(receiptPreviewPath),
]);

for (const file of publicFiles) {
  if (allowedMyKFiles.has(path.normalize(file))) continue;
  const text = fs.readFileSync(file, "utf8");
  if (/\bMyKs?\b/u.test(text)) {
    fail(`MyK naming leaked outside receipt scope: ${path.relative(root, file)}`);
  }
}

console.log("KKR RECEIPT-LABEL LOCK PASS");
console.log("mKUT RECEIPT LABEL: MyK");
console.log("sBLK RECEIPT LABEL: MyK");
console.log("STOREFRONT WORDING: UNCHANGED");
console.log("STRUCTURAL IDENTITIES: UNCHANGED");
console.log("WEBHOOK HEALTH: SEPARATE FROM NAMING AUTHORITY");
