import fs from "fs";
import path from "path";

const root = process.cwd();

const requiredFiles = [
  "app/page.tsx",
  "app/find/page.tsx",
  "app/api/bot/moments/route.ts",
  "app/hug/[id]/page.tsx",
  "public/mothers-day/thank-you-source.mp3",
  "promos/mothers-day.json",
];

const requiredHomepageText = [
  "Order Mother’s Day HUG",
  "A GPM HUG is a new kind",
  "Thank You — Source Preview",
  "One K-KUT per purchase per day",
];

const forbiddenPublicText = [
  "002 - KLEIGH",
  "039 - Elle Christine",
  "003 - Lloyd G Miller",
];

let failed = false;

function fail(message) {
  failed = true;
  console.error(`❌ ${message}`);
}

function pass(message) {
  console.log(`✅ ${message}`);
}

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) {
    fail(`Missing required file: ${file}`);
  } else {
    pass(`Found ${file}`);
  }
}

for (const file of ["app/page.tsx", "app/find/page.tsx"]) {
  const full = path.join(root, file);
  const text = fs.existsSync(full) ? fs.readFileSync(full, "utf8") : "";

  for (const needle of requiredHomepageText) {
    if (!text.includes(needle)) {
      fail(`${file} missing required text: ${needle}`);
    }
  }

  for (const bad of forbiddenPublicText) {
    if (text.includes(bad)) {
      fail(`${file} contains forbidden public display text: ${bad}`);
    }
  }
}

const apiDir = path.join(root, "app/api");
function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) out.push(...walk(full));
    else if (full.endsWith(".ts") || full.endsWith(".tsx")) out.push(full);
  }
  return out;
}

for (const file of walk(apiDir)) {
  const text = fs.readFileSync(file, "utf8");
  const rel = path.relative(root, file);

  if (text.includes("const supabase = createClient(")) {
    fail(`${rel} appears to create Supabase at module load.`);
  }
}

if (failed) {
  console.error("\nRelease check failed.");
  process.exit(1);
}

console.log("\nK-KUT release check passed.");
