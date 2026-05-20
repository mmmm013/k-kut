import fs from "fs";

const src = JSON.parse(fs.readFileSync("manifests/sandman-kk-combo-options.json", "utf8"));

const selectedIds = [
  "sandman_combo_02",
  "sandman_combo_28",
  "sandman_combo_77"
];

const selected = selectedIds.map((id, idx) => {
  const c = src.all_valid_contiguous_combo_options.find(x => x.combo_id === id);
  if (!c) throw new Error(`Missing combo ${id}`);

  return {
    materialize_order: idx + 1,
    combo_id: c.combo_id,
    pix: c.pix,
    product_or_offer: "KK_COMBO",
    object_lane: "PIX_KK_ONLY",
    mk_allowed: false,
    mini_kut_allowed: false,
    bot_dialog_allowed: false,
    title: c.title,
    role: c.role,
    start_section: c.start_section,
    end_section: c.end_section,
    section_count: c.section_count,
    kk_section_count: c.kk_section_count,
    connective_whoa_section_count: c.mk_optional_section_count,
    boundary_basis: "contiguous_song_sections_meaning_structure",
    order_rule: "original source order preserved",
    skip_rule: "no skipped sections inside selected span",
    time_rule: "no arbitrary time boundary; materialize exact section span after audio locator review",
    approval_status: "selected_for_audio_locator_review",
    sections: c.sections
  };
});

const out = {
  created_at: new Date().toISOString(),
  pix: "Sandman's Comin'",
  doctrine: {
    allowed_object_types: ["PIX", "KK", "KK_COMBO"],
    excluded_object_types: ["mK", "mini-KUT", "BOT_DIALOG", "prompt_asset"],
    selected_combo_count: selected.length,
    combo_rule: "contiguous KK sections only; source order preserved; no skipped sections; no mK products",
    whoa_rule: "Whoa sections are connective song structure inside selected combos when present; not standalone mKs in this lane."
  },
  selected_first_3_kk_combos: selected
};

fs.writeFileSync("manifests/sandman-first-3-kk-combo-materialization.json", JSON.stringify(out, null, 2));

console.log("selected first 3 Sandman KK-Combos:");
for (const c of selected) {
  console.log(`${c.materialize_order}. ${c.combo_id}: ${c.title}`);
}
console.log("wrote manifests/sandman-first-3-kk-combo-materialization.json");
