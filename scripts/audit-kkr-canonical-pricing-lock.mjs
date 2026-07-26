import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const lockPath = path.join(
  root,
  'config',
  'kkr-canonical-product-price-lock.v1.json',
);
const mirrorPath = path.join(root, 'lib', 'kkr-canonical-pricing.ts');

const expected = Object.freeze({
  VOCAL_NOTE_OR_TYPED_MESSAGE_ADDON: 99,
  mKUT: 199,
  sBLK: 499,
  BLK: 799,
  PROMOTIONAL_HUG: 1199,
  STANDARD_HUG: 1499,
});

function fail(message) {
  console.error(`KKR CANONICAL PRICE LOCK FAIL: ${message}`);
  process.exit(1);
}

if (!fs.existsSync(lockPath)) fail('machine-readable lock is missing');
if (!fs.existsSync(mirrorPath)) fail('TypeScript canonical mirror is missing');

const lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'));

if (lock.schema_version !== 'KKR_CANONICAL_PRODUCT_PRICE_LOCK_V001') {
  fail('schema version changed');
}
if (lock.status !== 'PERMANENT_CANONICAL_LAW') {
  fail('canonical status changed');
}
if (lock.currency !== 'USD') fail('currency must remain USD');
if (lock.source_authority !== 'GPMC') {
  fail('GPMC must remain the source authority');
}
if (lock.change_control?.silent_edits_prohibited !== true) {
  fail('silent edits must remain prohibited');
}
if (lock.change_control?.explicit_GD_decision_required !== true) {
  fail('an explicit GD decision must remain required');
}

for (const [name, cents] of Object.entries(expected)) {
  if (lock.prices_cents?.[name] !== cents) {
    fail(`${name} must remain ${cents} cents`);
  }
}

if (lock.structural_law?.mKUT_is_sBLK !== false) {
  fail('mKUT must not equal sBLK');
}
if (!String(lock.structural_law?.sBLK || '').includes('Verse 1a')) {
  fail('sBLK must remain defined as a BLK segment');
}

const mirror = fs.readFileSync(mirrorPath, 'utf8');
for (const [name, cents] of Object.entries(expected)) {
  if (!new RegExp(`${name}\\s*:\\s*${cents}\\b`).test(mirror)) {
    fail(`TypeScript mirror drift: ${name}`);
  }
}
if (!/mKUT_is_sBLK\s*:\s*false/.test(mirror)) {
  fail('TypeScript mirror structural drift');
}

console.log('KKR CANONICAL PRODUCT / PRICE LOCK AUDIT PASS');
console.log('mKUT: $1.99');
console.log('sBLK: $4.99');
console.log('BLK: $7.99');
console.log('Vocal-note/message add-on: $0.99');
console.log('Promotional HUG: $11.99');
console.log('Standard HUG: $14.99');
console.log('STRUCTURAL LAW: sBLK is a BLK segment; mKUT is not sBLK.');
