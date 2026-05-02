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
  console.error("\n❌ Missing required environment variables:\n");
  for (const key of missing) {
    console.error(`   • ${key}`);
  }
  console.error(
    "\nLocal dev: .env.local is loaded automatically by scripts/check-env.mjs." +
    "\nVercel: Project → Settings → Environment Variables must include these keys.\n"
  );
  process.exit(1);
}

console.log("✅ Required environment variables are present.");
