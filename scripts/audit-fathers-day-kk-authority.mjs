import fs from "node:fs";

const authorityPath = "data/fathers-day/fathers-day-source-authority.json";
const badReportMd = "reports/fathers-day/fathers-day-kk-pool.md";
const badReportJson = "reports/fathers-day/fathers-day-kk-pool.json";

let failed = false;

function fail(msg) {
  console.error("FAIL:", msg);
  failed = true;
}

function read(file) {
  try {
    return fs.readFileSync(file, "utf8");
  } catch {
    return "";
  }
}

console.log("FATHER’S DAY KK AUTHORITY AUDIT");

if (!fs.existsSync(authorityPath)) {
  fail(`Missing ${authorityPath}`);
} else {
  const authority = JSON.parse(read(authorityPath));
  const names = authority.approved_sources.flatMap((s) => [s.canonical, s.display, ...s.variants]);
  const excluded = authority.excluded_titles;

  for (const needed of ["No Mystery", "Life’s a Test", "That’s a Have To", "Have-To", "That Empty Chair"]) {
    if (!names.some((n) => n.toLowerCase().includes(needed.toLowerCase().replace("’", "'")) || needed.toLowerCase().includes(n.toLowerCase().replace("’", "'")))) {
      fail(`Authority missing required Father’s Day source: ${needed}`);
    }
  }

  const old = read(badReportMd) + "\n" + read(badReportJson);

  for (const title of excluded) {
    if (old.toLowerCase().includes(title.toLowerCase())) {
      console.error(`KNOWN BAD OLD REPORT CONTAMINATION: ${title}`);
    }
  }

  if (old.includes("- No Mystery: 1") || old.includes("- Life’s a Test: 1") || old.includes("- That Empty Chair: 1")) {
    console.error("KNOWN BAD OLD REPORT COLLAPSE: source title collapsed to one row.");
  }
}

if (failed) {
  console.error("FATHER’S DAY KK AUTHORITY AUDIT: FAIL");
  process.exit(1);
}

console.log("FATHER’S DAY KK AUTHORITY AUDIT: PASS");
console.log("Note: old report may still be known-bad until replaced by strict extractor.");
