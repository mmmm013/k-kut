import { spawnSync } from "node:child_process";

const route = process.argv[2];

if (!route || !route.startsWith("/")) {
  console.error("Usage: node scripts/bic-release-route.mjs /route");
  process.exit(1);
}

function run(label, cmd, args, opts = {}) {
  console.log(`\n---- ${label} ----`);
  const res = spawnSync(cmd, args, {
    stdio: "inherit",
    shell: false,
    ...opts,
  });

  if (res.status !== 0) {
    console.error(`\nFAIL: ${label}`);
    process.exit(res.status || 1);
  }
}

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

const slug = route.replace(/^\//, "").replace(/\//g, "-");

run("approved Stripe audit", "node", ["scripts/audit-approved-stripe-links.mjs"]);
run("delivery padding + Twinkle audit", "node", [
  "scripts/audit-all-ii-delivery-bookend-twinkle.mjs",
]);
run("build", "npm", ["run", "build"]);

run("git status before commit", "git", ["status", "--short"]);

run("git add route release files", "git", [
  "add",
  `app${route}/page.tsx`,
  "data/bic-routes/routes.json",
  "scripts/bic-release-route.mjs",
]);

const commit = spawnSync(
  "git",
  ["commit", "-m", `BIC release ${route}`],
  { stdio: "inherit" }
);

if (commit.status !== 0) {
  console.log("\nNo commit created. Continuing to push/audit in case changes were already committed.");
}

run("push", "git", ["push", "origin", "main"]);

console.log("\n---- wait for production deploy/cache ----");
sleep(60000);

run(`production BIC audit ${route}`, "node", [
  "scripts/bic-route-production-audit.mjs",
  route,
]);

console.log(`\nBIC RELEASE COMPLETE: ${route}`);
