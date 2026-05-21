import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const APPROVED_WEDDING_SOURCE_TERMS = ["forever", "a day"];

function isApprovedWeddingRow(row) {
  const haystack = [
    row.delivered_url_or_path,
    row.track_id,
    row.kut_id,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return APPROVED_WEDDING_SOURCE_TERMS.every((term) => haystack.includes(term));
}

const { data: activeRows, error: fetchError } = await supabase
  .from("k_kut_launch_audio")
  .select("*")
  .eq("slug", "wedding")
  .eq("is_active", true)
  .order("sort_order", { ascending: true });

if (fetchError) {
  console.error("Failed to fetch active wedding launch rows:", fetchError.message);
  process.exit(1);
}

const badRows = (activeRows ?? []).filter((row) => !isApprovedWeddingRow(row));

console.log("Active wedding launch rows:", activeRows ?? []);
console.log("Rows to quarantine:", badRows.map((row) => ({ id: row.id, kut_id: row.kut_id, delivered_url_or_path: row.delivered_url_or_path })));

if (badRows.length > 0) {
  const { data: disabled, error: disableError } = await supabase
    .from("k_kut_launch_audio")
    .update({ is_active: false })
    .in("id", badRows.map((row) => row.id))
    .select("*");

  if (disableError) {
    console.error("Failed to quarantine bad wedding launch rows:", disableError.message);
    process.exit(1);
  }

  console.log("Quarantined bad wedding launch rows:", disabled);
}

const { data: remaining, error: remainingError } = await supabase
  .from("k_kut_launch_audio")
  .select("*")
  .eq("slug", "wedding")
  .eq("is_active", true)
  .order("sort_order", { ascending: true });

if (remainingError) {
  console.error("Failed to verify remaining wedding launch rows:", remainingError.message);
  process.exit(1);
}

console.log("Remaining active wedding launch rows:", remaining ?? []);

const stillBad = (remaining ?? []).filter((row) => !isApprovedWeddingRow(row));
if (stillBad.length > 0) {
  console.error("CONTROL FAILURE: unapproved wedding rows still active:", stillBad);
  process.exit(1);
}

console.log("PASS: wedding launch rows are clean for Forever & A Day only.");
