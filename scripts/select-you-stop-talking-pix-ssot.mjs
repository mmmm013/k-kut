import { createClient } from "@supabase/supabase-js";
import fs from "fs";

const SELECTED_PIX = "YOU STOP TALKING - 1988.wav";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const { data, error } = await supabase.storage
  .from("tracks")
  .list("", { limit: 1000, sortBy: { column: "name", order: "asc" } });

if (error) throw error;

const found = data.find((x) => x.name === SELECTED_PIX);
if (!found) {
  console.error("Selected PIX not found:", SELECTED_PIX);
  process.exit(1);
}

const { data: pub } = supabase.storage.from("tracks").getPublicUrl(found.name);

const out = {
  created_at: new Date().toISOString(),
  pix_title: "You Stop Talking",
  selected_pix_filename: found.name,
  selected_pix_bucket: "tracks",
  selected_pix_ssot_url: pub.publicUrl,
  selected_pix_size: found.metadata?.size ?? null,
  alternate_reference_files: [
    "You Stop Talking - East Houston 1988 (1).mp3",
    "You Stop Talking - East Houston 1988.mp3"
  ],
  source_role: "PIX_SSOT",
  disco_reference: {
    short_share_url: "https://s.disco.ac/ellhzvoycaau",
    embed_playlist_id: "23705238",
    embed_url: "https://musicmaykers.disco.ac/e/p/23705238?download=true&s=lkb6q_pByz00TUB39wNs_IVvWJg%3AJ8bq8By4&artwork=true&color=%234E98FF&theme=white"
  },
  doctrine: {
    disco_is_reference_not_ssot: true,
    supabase_tracks_is_current_pix_ssot: true,
    cc_is_capture_mechanism_not_product: true,
    cc_produces_or_anchors_iis: true,
    pix_pck_required: true,
    frontend_obeys_script_only: true
  },
  status: "pix_ssot_selected_needs_pix_pck_build"
};

fs.writeFileSync(
  "manifests/pix-pck/you-stop-talking-pix-ssot.json",
  JSON.stringify(out, null, 2)
);

console.log("selected PIX SSOT:");
console.log(JSON.stringify(out, null, 2));
console.log("wrote manifests/pix-pck/you-stop-talking-pix-ssot.json");
