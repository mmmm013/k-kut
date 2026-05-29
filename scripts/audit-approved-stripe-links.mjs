import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const SEARCH_DIRS = ["app", "components", "lib", "scripts", "data", "public", "."];

const IGNORE_PARTS = [
  "node_modules",
  ".next",
  ".git",
  ".vercel",
  ".env.local.pre-bic-fix",

  // Historical / non-live evidence and recovery material.
  // Do not rewrite patent evidence or rejected backups just to satisfy live checkout audit.
  "backups/",
  "docs/patent/evidence/",
  "recovery-review/",
];

const APPROVED_STRIPE_LINKS = new Set([
  // Wedding packages
  "https://buy.stripe.com/4gM6oG5cifaW41C7Js4ow0t",
  "https://buy.stripe.com/bJeaEW8ou2oa0PqfbU4ow0u",
  "https://buy.stripe.com/dRm6oG34agf0dCcaVE4ow0v",

  // KUPID / intent HUG general placeholder
  "https://buy.stripe.com/cNi28qfQW4wi41C7Js4ow0s",

  // K-UPID / Valentine reuse fulfillment
  // Reuse existing Valentine / K-UPID inventory.
  // Do not create duplicate II unless ADMIN explicitly directs it.
  "https://buy.stripe.com/5kQ8wO206bYKcy88Nw4ow0k",

  // Personal / Wedding Track Pack
  "https://buy.stripe.com/28EfZg6gme6S8hS1l44ow0r",
  "https://buy.stripe.com/bJe5kCeMSd2OeGg4xg4ow0q",

  // Current HUG env links
  "https://buy.stripe.com/fZu8wOawC4wicy8fbU4ow0y",
  "https://buy.stripe.com/aFabJ0cEK5Amaq09RA4ow0A",
  "https://buy.stripe.com/aFadR8eMS5Am55G2p84ow0x",

  // ADMIN OVERRIDE ONLY:
  // mKs / mini-KUTs are forbidden in public buyer flow.
  // This payment link may exist, but must not be exposed publicly
  // unless ADMIN override is explicitly active.
  "https://buy.stripe.com/9B6eVcawC7Iu1Tu2p84ow0w",
]);

const STRIPE_RE = /https:\/\/buy\.stripe\.com\/[A-Za-z0-9]+/g;

function shouldIgnore(rel) {
  return IGNORE_PARTS.some((part) => rel.includes(part));
}

function walk(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const rel = path.relative(ROOT, full);

    if (shouldIgnore(rel)) continue;

    if (entry.isDirectory()) {
      out.push(...walk(full));
    } else if (
      /\.(ts|tsx|js|jsx|json|md|html|txt|mjs|cjs)$/.test(entry.name) ||
      entry.name.startsWith(".env")
    ) {
      out.push(full);
    }
  }

  return out;
}

const files = [];
for (const dir of SEARCH_DIRS) {
  const full = path.join(ROOT, dir);
  files.push(...walk(full));
}

const uniqueFiles = [...new Set(files)].sort();
const findings = [];

for (const file of uniqueFiles) {
  const rel = path.relative(ROOT, file);
  if (shouldIgnore(rel)) continue;

  const text = fs.readFileSync(file, "utf8");
  const lines = text.split(/\r?\n/);

  lines.forEach((line, idx) => {
    const matches = line.match(STRIPE_RE) || [];
    for (const url of matches) {
      findings.push({
        file: rel,
        line: idx + 1,
        url,
        approved: APPROVED_STRIPE_LINKS.has(url),
      });
    }
  });
}

const unique = [...new Set(findings.map((f) => f.url))].sort();
const unapproved = findings.filter((f) => !f.approved);

console.log("APPROVED STRIPE LINKS:", APPROVED_STRIPE_LINKS.size);
console.log("FOUND UNIQUE STRIPE LINKS:", unique.length);
console.log("");

for (const url of unique) {
  const ok = APPROVED_STRIPE_LINKS.has(url) ? "APPROVED" : "UNAPPROVED";
  console.log(`${ok} ${url}`);
}

console.log("");

for (const f of findings) {
  const ok = f.approved ? "OK" : "BAD";
  console.log(`${ok} ${f.file}:${f.line} ${f.url}`);
}

if (APPROVED_STRIPE_LINKS.size !== 11) {
  console.error("");
  console.error("FAIL: approved Stripe allow-list is not 11 current live links yet.");
  console.error("Current approved count:", APPROVED_STRIPE_LINKS.size);
  process.exit(1);
}

if (unapproved.length > 0) {
  console.error("");
  console.error("FAIL: unapproved Stripe links found.");
  process.exit(1);
}

console.log("");
console.log("DOCTRINE: mKs / mini-KUTs are forbidden in public buyer flow unless ADMIN override is active.");
console.log("DOCTRINE: mK inventory may be searched/matched internally only when authorized by ADMIN override.");
console.log("DOCTRINE: Public buyer UI must not expose mK / mini-KUT / mini language by default.");
console.log("DOCTRINE: K-UPID / Valentine reuse fulfillment must reuse existing II/candidates first.");
console.log("DOCTRINE: Do not create the same II twice unless ADMIN explicitly directs it.");
console.log("");
console.log("PASS: only approved Stripe links found.");
