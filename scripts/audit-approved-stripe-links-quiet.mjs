import { execFileSync } from "node:child_process";

console.log("APPROVED STRIPE LINKS QUIET AUDIT");

try {
  const output = execFileSync("node", ["scripts/audit-approved-stripe-links.mjs"], {
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 20
  });

  if (!output.includes("PASS: only approved Stripe links found.")) {
    console.error("FAIL: approved Stripe audit did not report PASS.");
    console.error(output.slice(-4000));
    process.exit(1);
  }

  const approvedMatch = output.match(/APPROVED STRIPE LINKS:\s*(\d+)/);
  const foundMatch = output.match(/FOUND UNIQUE STRIPE LINKS:\s*(\d+)/);

  console.log(`PASS: approved Stripe links only. approved=${approvedMatch?.[1] || "unknown"} found=${foundMatch?.[1] || "unknown"}`);
} catch (error) {
  console.error("FAIL: approved Stripe audit failed.");
  const stdout = error.stdout ? String(error.stdout) : "";
  const stderr = error.stderr ? String(error.stderr) : "";
  console.error((stdout + "\n" + stderr).slice(-4000));
  process.exit(1);
}
