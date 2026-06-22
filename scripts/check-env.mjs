
{
  const { execFileSync } = await import("node:child_process");
  execFileSync(process.execPath, ["scripts/audit-universal-kut-adjust-retest-drafts-v1.mjs"], {
    stdio: "inherit"
  });
}


{
  const { execFileSync } = await import("node:child_process");
  execFileSync(process.execPath, ["scripts/audit-universal-kut-linear-factory-processing-lanes-v1.mjs"], {
    stdio: "inherit"
  });
}


// Universal KUT factory room gate: reviewer sees next candidate, not raw Terminal note traps.
{
  const { execFileSync } = await import("node:child_process");
  execFileSync(process.execPath, ["scripts/audit-universal-kut-processing-factory-room-v1.mjs"], {
    stdio: "inherit"
  });
}


// GPMx Twinkle source binding gate: canonical Twinkle must be a single universal STI source path.
{
  const { execFileSync } = await import("node:child_process");
  execFileSync(process.execPath, ["scripts/audit-gpmx-twinkle-source-discovery-v1.mjs"], {
    stdio: "inherit"
  });
}


// UKUT-WO-002 exact-cut draft gate: rendered drafts are review-only, not release-ready.
{
  const { execFileSync } = await import("node:child_process");
  execFileSync(process.execPath, ["scripts/audit-ukut-wo-002-exact-cut-drafts-v1.mjs"], {
    stdio: "inherit"
  });
}


// UKUT-WO-002 room navigation + human decision gate: no raw notes pasted into Terminal.
{
  const { execFileSync } = await import("node:child_process");
  execFileSync(process.execPath, ["scripts/audit-ukut-wo-002-room-navigation-and-human-decision-v1.mjs"], {
    stdio: "inherit"
  });
}


// GPM color schema + Twinkle gate: review rooms must show brand/control environment.
{
  const { execFileSync } = await import("node:child_process");
  execFileSync(process.execPath, ["scripts/audit-gpm-color-schema-and-twinkle-review-room.mjs"], {
    stdio: "inherit"
  });
}


// UKUT-WO-002 playable boundary room gate: review only, no render and no release state.
{
  const { execFileSync } = await import("node:child_process");
  execFileSync(process.execPath, ["scripts/audit-ukut-wo-002-boundary-confirmation-room-v1.mjs"], {
    stdio: "inherit"
  });
}


// UKUT-WO-002 boundary packet gate: boundary review only, no release state.
{
  const { execFileSync } = await import("node:child_process");
  execFileSync(process.execPath, ["scripts/audit-ukut-wo-002-boundary-confirmation-packet-v1.mjs"], {
    stdio: "inherit"
  });
}


// Universal KUT processing first-move gate: first in-processing item is not release-ready.
{
  const { execFileSync } = await import("node:child_process");
  execFileSync(process.execPath, ["scripts/audit-universal-kut-processing-first-move-v1.mjs"], {
    stdio: "inherit"
  });
}


// Universal KUT processing work order gate: work orders do not equal release-ready audio.
{
  const { execFileSync } = await import("node:child_process");
  execFileSync(process.execPath, ["scripts/audit-universal-kut-processing-work-orders-v1.mjs"], {
    stdio: "inherit"
  });
}


// KUT candidate rolling queue gate: no fixed approved pile.
{
  const { execFileSync } = await import("node:child_process");
  execFileSync(process.execPath, ["scripts/audit-kut-candidate-rolling-queue-rule.mjs"], {
    stdio: "inherit"
  });
}


// KUT candidate language gate: human-selected candidates are next-in-line, not release-ready.
{
  const { execFileSync } = await import("node:child_process");
  execFileSync(process.execPath, ["scripts/audit-kut-candidate-next-in-line-language.mjs"], {
    stdio: "inherit"
  });
}


// GPMx Signature Audio Branding architecture gate: universal product sonic branding, not BUG-specific.
{
  const { execFileSync } = await import("node:child_process");
  execFileSync(process.execPath, ["scripts/audit-gpmx-signature-audio-branding-universal-not-bug.mjs"], {
    stdio: "inherit"
  });
}


// GPMx Signature Audio Branding gate: release-bound KUTs require padding, slight end fade, and Twinkle from SSOT.
{
  const { execFileSync } = await import("node:child_process");
  execFileSync(process.execPath, ["scripts/audit-gpmx-signature-audio-branding-required.mjs"], {
    stdio: "inherit"
  });
}


// BUG inventory gate: BUG index may only point to neutral Short-KUT inventory.
{
  const { execFileSync } = await import("node:child_process");
  execFileSync(process.execPath, ["scripts/audit-bug-eligible-short-kuts-index.mjs"], {
    stdio: "inherit"
  });
}


// BUG gate: $1.99 each, 1–5 only, Short-KUT-only, safety/tone protected.
{
  const { execFileSync } = await import("node:child_process");
  execFileSync(process.execPath, ["scripts/audit-bug-pricing-repeat-safety.mjs"], {
    stdio: "inherit"
  });
}


// Strict K-KUT boundary gate: themes are containers only, never audio identity.
{
  const { execFileSync } = await import("node:child_process");
  execFileSync(process.execPath, ["scripts/audit-theme-container-audio-separation.mjs"], {
    stdio: "inherit"
  });
}

import fs from "fs";
import path from "path";
import dotenv from "dotenv";

const envLocalPath = path.join(process.cwd(), ".env.local");

if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
}

const REQUIRED = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
];

const missing = REQUIRED.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error("\n⚠️ Missing environment variables:\n");
  for (const key of missing) {
    console.error(`   • ${key}`);
  }

  if (process.env.VERCEL === "1") {
    console.error(
      "\nVercel deploy will continue so static public pages can ship." +
      "\nSupabase-backed API routes will return their built-in env error until Vercel env vars are set.\n"
    );
    process.exit(0);
  }

  console.error(
    "\nLocal dev: .env.local is loaded automatically by scripts/check-env.mjs." +
    "\nVercel: Project → Settings → Environment Variables should include these keys.\n"
  );
  process.exit(1);
}

console.log("✅ Required environment variables are present.");
