import fs from "node:fs";

const files = [
  "app/page.tsx",
  "app/hug/mothers-day/page.tsx",
];

let fail = 0;

console.log("\nK-KUT VOICE USE TRACE");
console.log("====================\n");

for (const file of files) {
  const text = fs.readFileSync(file, "utf8");
  const lines = text.split(/\n/);

  console.log(`FILE: ${file}`);

  lines.forEach((line, idx) => {
    if (
      line.includes("playBotVoice(") ||
      line.includes("STRIPE_URL") ||
      line.includes("Checkout") ||
      line.includes("Buy") ||
      line.includes("I don’t understand") ||
      line.includes("show me the demo")
    ) {
      console.log(`${String(idx + 1).padStart(4, " ")}: ${line.trim()}`);
    }
  });

  const checkoutWindow = lines
    .map((line, idx) => ({ line, idx }))
    .filter(({ line }) => /checkout|Checkout|Buy|STRIPE_URL/i.test(line))
    .map(({ idx }) => lines.slice(Math.max(0, idx - 6), idx + 7).join("\n"))
    .join("\n---\n");

  if (checkoutWindow.includes('playBotVoice("welcome")')) {
    console.log(`FAIL: ${file} has checkout/buy area calling welcome.`);
    fail++;
  }

  console.log("");
}

if (fail > 0) {
  console.log(`SUMMARY: FAIL ${fail}`);
  process.exit(1);
}

console.log("SUMMARY: PASS — no checkout/buy area calls welcome.");
