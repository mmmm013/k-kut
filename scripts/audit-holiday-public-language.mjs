import fs from "node:fs";

const files = [
  "app/fathers-day/page.tsx"
].filter((file) => fs.existsSync(file));

const forbidden = [
  /\bpremade\b/i,
  /\bresident\b/i,
  /\binventory\b/i,
  /\bRelease Gate\b/i,
  /\bDispatch\b/i,
  /\bDP\b/i,
  /\bproduct-bound\b/i,
  /\bart-tail\b/i,
  /\bcanonical\b/i,
  /\bTwinkle\b/i,
  /\bsource lane\b/i,
  /\breview lane\b/i,
  /\bproof lane\b/i,
  /\bholiday owns\b/i,
  /\bFather.?s Day owns\b/i,
  /\bFD owns\b/i
];

let failures = [];

for (const file of files) {
  const text = fs.readFileSync(file, "utf8");
  const lines = text.split(/\r?\n/);

  lines.forEach((line, index) => {
    for (const pattern of forbidden) {
      if (pattern.test(line)) {
        failures.push(`${file}:${index + 1}: ${line.trim()}`);
      }
    }
  });
}

if (failures.length) {
  console.error("HOLIDAY PUBLIC LANGUAGE AUDIT: FAIL");
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("HOLIDAY PUBLIC LANGUAGE AUDIT: PASS");
console.log("Public holiday pages avoid internal K-KUT doctrine/routing jargon.");
