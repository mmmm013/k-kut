import fs from "node:fs";

const page = "app/fathers-day/page.tsx";
const text = fs.readFileSync(page, "utf8");

const required = [
  /const publicCode = `KK\$\{index \+ 1\}`;/,
  /<h3>\{publicCode\}<\/h3>/,
  /Ready match/,
];

const forbidden = [
  /<h3>\{title\}<\/h3>/,
  /<span>\{item\.feelingLane/,
  /\{item\.displayCopy \?\?/,
  /publicFamily/,
  /publicTitle.*<\/h3>/,
  /productTitle.*<\/h3>/,
  /Ring the Bell/,
  /I’m No Mystery/,
  /I'm No Mystery/,
  /Have-To/,
  /Have To/,
  /No Mystery Billy/,
];

let fail = [];

for (const rx of required) {
  if (!rx.test(text)) fail.push(`Missing required public numbering pattern: ${rx}`);
}

for (const rx of forbidden) {
  if (rx.test(text)) fail.push(`Forbidden public title/detail pattern found: ${rx}`);
}

if (fail.length) {
  console.error("PUBLIC KK NUMBERING AUDIT: FAIL");
  console.error(fail.join("\n"));
  process.exit(1);
}

console.log("PUBLIC KK NUMBERING AUDIT: PASS");
console.log("Shopper-facing K-KUT cards use KK numbers, not titles/source names.");
