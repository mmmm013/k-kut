import fs from "node:fs";
import path from "node:path";

const files = [];

function collect(current) {
  const normalized = current.replaceAll("\\", "/");

  if (
    normalized === "app/_saved-ui" ||
    normalized.startsWith("app/_saved-ui/")
  ) {
    return;
  }

  if (!fs.existsSync(current)) return;

  const stat = fs.statSync(current);

  if (stat.isDirectory()) {
    for (const name of fs.readdirSync(current)) {
      collect(path.join(current, name));
    }
    return;
  }

  if (/\.(?:ts|tsx|js|mjs|json)$/u.test(current)) {
    files.push(current);
  }
}

for (const root of ["app", "components", "lib"]) {
  collect(root);
}

const runtime = files
  .map((file) => fs.readFileSync(file, "utf8"))
  .join("\n");

for (const required of [
  "K-KUT HUG",
  "$7.99",
  "2,611",
]) {
  if (!runtime.includes(required)) {
    console.error(
      `PUBLIC PRICING / RELEASE UI AUDIT: FAIL missing ${required}`,
    );
    process.exit(1);
  }
}

for (const forbidden of [
  "sK HUG",
  "$4.99",
  "SK_HUG_PRICE_CENTS",
  "NEXT_PUBLIC_SK_HUG_LINK",
  "EXPECTED_SK_COUNT",
  "3867",
  "Big HUG",
  "$12.99",
  "NEXT_PUBLIC_MD_",
  "Mother’s Day",
  "Mother's Day",
  "Father’s Day",
  "Father's Day",
  "/mothers-day",
  "/fathers-day",
]) {
  if (runtime.includes(forbidden)) {
    console.error(
      `PUBLIC PRICING / RELEASE UI AUDIT: FAIL exposes ${forbidden}`,
    );
    process.exit(1);
  }
}

console.log("PUBLIC PRICING / RELEASE UI AUDIT: PASS");
console.log("K-KUT HUG: $7.99");
console.log("VERIFIED KK SOURCE: 2611");
console.log("PUBLIC sK ASSUMPTION: NONE");
console.log("PERMANENT NAMED-HOLIDAY RUNTIME: NONE");
