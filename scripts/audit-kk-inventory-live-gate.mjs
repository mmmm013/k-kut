import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env.production.local", override: false });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const failures = [];

function check(name, ok) {
  console.log(`${ok ? "PASS" : "FAIL"} - ${name}`);
  if (!ok) failures.push(name);
}

console.log("\nKK LIVE INVENTORY DEPLOY GATE");
console.log("=============================\n");

const { count: kkCount, error: kkCountError } = await supabase
  .from("k_kuts")
  .select("*", { count: "exact", head: true })
  .eq("pass_type", "LT-PIX")
  .eq("generated_by", "gpmx-first-pass-process.mjs");

if (kkCountError) {
  console.error(kkCountError);
  process.exit(1);
}

const { data: missingKks, error: missingKksError } = await supabase
  .from("k_kuts")
  .select("kut_id,title,track_id,pass_type,generated_by,delivered_url_or_path,status_ok_or_broken")
  .eq("pass_type", "LT-PIX")
  .eq("generated_by", "gpmx-first-pass-process.mjs")
  .or("delivered_url_or_path.is.null,delivered_url_or_path.eq.");

if (missingKksError) {
  console.error(missingKksError);
  process.exit(1);
}

const { count: mkCount, error: mkCountError } = await supabase
  .from("mks")
  .select("*", { count: "exact", head: true })
  .eq("status", "active");

if (mkCountError) {
  console.error(mkCountError);
  process.exit(1);
}

const { data: missingMks, error: missingMksError } = await supabase
  .from("mks")
  .select("id,mk_id,title,status,audio_url,mp3_url")
  .eq("status", "active")
  .or("audio_url.is.null,mp3_url.is.null");

if (missingMksError) {
  console.error(missingMksError);
  process.exit(1);
}

check("Real generated LT-PIX K-KUT count is positive", kkCount > 0);
check("No real generated LT-PIX K-KUT missing delivered_url_or_path", missingKks.length === 0);
check("Active mK count is positive", mkCount > 0);

// mKs may use either audio_url or mp3_url; fail only when both are blank/null.
const trulyMissingMks = (missingMks ?? []).filter((row) => !row.audio_url && !row.mp3_url);
check("No active mK missing both audio_url and mp3_url", trulyMissingMks.length === 0);

console.log("");
console.log(`Real generated LT-PIX K-KUTs: ${kkCount}`);
console.log(`Active mKs: ${mkCount}`);
console.log(`Bad real K-KUTs: ${missingKks.length}`);
console.log(`Bad active mKs: ${trulyMissingMks.length}`);

if (missingKks.length) {
  console.log("\nBad real K-KUT rows:");
  console.log(JSON.stringify(missingKks, null, 2));
}

if (trulyMissingMks.length) {
  console.log("\nBad active mK rows:");
  console.log(JSON.stringify(trulyMissingMks.slice(0, 20), null, 2));
}

console.log("\nSUMMARY");
console.log("=======");
console.log(`Fail: ${failures.length}`);

if (failures.length) process.exit(1);
