import fs from "fs";

const manifest = JSON.parse(fs.readFileSync("manifests/sandman-first-3-kk-combo-materialization.json", "utf8"));

const sourcePixCandidates = [
  "SANDMAN'S COMIN'.mp3",
  "Sandman's Comin' - Rock - Sports_Life.mp3",
  "SANDMAN'S COMIN' - 90bpm.wav",
  "SANDMAN'S COMIN' - INSTRO PLUS WHOA'S 90bpm.wav"
];

const worksheet = {
  created_at: new Date().toISOString(),
  pix: manifest.pix,
  status: "needs_owner_audio_locator_review",
  purpose: "Locate exact start/end times for selected KK-Combo section spans from the PIX master.",
  doctrine: {
    allowed_object_types: ["PIX", "KK", "KK_COMBO"],
    excluded_object_types: ["mK", "mini-KUT", "BOT_DIALOG", "prompt_asset"],
    locator_rule: "time is technical locator only after section/meaning boundaries are chosen",
    combo_rule: "contiguous KK sections only; original order preserved; no skipped sections",
    materialization_rule: "cut exact combo audio from PIX master only; do not reuse old mK fragments"
  },
  source_pix_candidates: sourcePixCandidates,
  locator_rows: manifest.selected_first_3_kk_combos.map(c => ({
    materialize_order: c.materialize_order,
    combo_id: c.combo_id,
    title: c.title,
    role: c.role,
    selected_sections: c.sections,
    owner_locator_fields: {
      exact_start_sec: null,
      exact_end_sec: null,
      start_boundary_phrase_or_sound: "",
      end_boundary_phrase_or_sound: "",
      locator_confidence: "",
      listen_notes: ""
    },
    materialization_status: "needs_exact_locator"
  }))
};

fs.writeFileSync("manifests/sandman-first-3-audio-locator-worksheet.json", JSON.stringify(worksheet, null, 2));

console.log("locator worksheet rows:", worksheet.locator_rows.length);
console.log("wrote manifests/sandman-first-3-audio-locator-worksheet.json");
