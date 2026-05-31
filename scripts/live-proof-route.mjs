const args = process.argv.slice(2);

const url = args.shift();

if (!url) {
  console.error("FAIL: Missing URL.");
  process.exit(1);
}

const must = [];
const mustNot = [];

for (let i = 0; i < args.length; i += 1) {
  if (args[i] === "--must") must.push(args[++i]);
  else if (args[i] === "--must-not") mustNot.push(args[++i]);
  else {
    console.error(`FAIL: Unknown argument ${args[i]}`);
    process.exit(1);
  }
}

const response = await fetch(url, { redirect: "manual" });
const text = await response.text();

let failed = false;

if (response.status < 200 || response.status >= 400) {
  console.error(`FAIL: ${url} returned HTTP ${response.status}`);
  failed = true;
}

for (const phrase of must) {
  if (!text.includes(phrase)) {
    console.error(`FAIL: ${url} missing required phrase: ${phrase}`);
    failed = true;
  }
}

for (const phrase of mustNot) {
  if (text.includes(phrase)) {
    console.error(`FAIL: ${url} contains forbidden phrase: ${phrase}`);
    failed = true;
  }
}

if (failed) process.exit(1);

console.log(`PASS: ${url}`);
