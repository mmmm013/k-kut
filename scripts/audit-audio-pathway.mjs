import fs from "node:fs";

const files = [
  "app/personal/page.tsx",
  "app/personal/birthday/page.tsx",
  "app/personal/[slug]/page.tsx"
];

let failed = false;

function fail(message) {
  console.error("FAIL:", message);
  failed = true;
}

function extractAudioUrls(source) {
  const urls = [];
  const regex = /audioUrl:\s*["']([^"']+)["']/g;
  let match;
  while ((match = regex.exec(source))) {
    urls.push(match[1]);
  }
  return urls;
}

console.log("AUDIO PATHWAY AUDIT");

const allUrls = [];

for (const file of files) {
  if (!fs.existsSync(file)) {
    fail(`Missing ${file}`);
    continue;
  }

  const src = fs.readFileSync(file, "utf8");
  const urls = extractAudioUrls(src);

  if (file.includes("birthday") && urls.length < 1) {
    fail("Birthday page must include audioUrl entries.");
  }

  for (const url of urls) {
    allUrls.push({ file, url });

    if (!url.startsWith("/")) {
      fail(`${file} audioUrl must be site-relative, got ${url}`);
    }

    if (!url.endsWith(".mp3") && !url.endsWith(".m4a") && !url.endsWith(".wav")) {
      fail(`${file} audioUrl must be audio file path, got ${url}`);
    }

    for (const forbidden of ["candidate", "debug", "staging", "test"]) {
      if (url.toLowerCase().includes(forbidden)) {
        fail(`${file} audioUrl contains forbidden term ${forbidden}: ${url}`);
      }
    }
  }
}

const unique = [...new Set(allUrls.map((row) => row.url))];

if (unique.length < 1) {
  fail("No audio URLs found in sellable personal pages.");
}

if (failed) {
  console.error("AUDIO PATHWAY AUDIT: FAIL");
  process.exit(1);
}

console.log(`AUDIO PATHWAY AUDIT: PASS (${unique.length} unique audio URLs)`);
for (const url of unique) console.log(`AUDIO ${url}`);
