import fs from "fs";

const sections = [
  { id: "intro", label: "Intro", lane: "kk" },
  { id: "whoa_1", label: "Whoa Whoa", lane: "mk_optional" },
  { id: "v1a", label: "V1a", lane: "kk" },
  { id: "break_1", label: "Break / Bridge", lane: "kk" },
  { id: "whoa_2", label: "Whoa Whoa", lane: "mk_optional" },
  { id: "v1b", label: "V1b", lane: "kk" },
  { id: "echo_1", label: "Echo — so I can claim the crown", lane: "kk" },
  { id: "ch1", label: "Ch1", lane: "kk" },
  { id: "v2", label: "V2", lane: "kk" },
  { id: "echo_2", label: "Echo — the only fear I have", lane: "kk" },
  { id: "ch2", label: "Ch2", lane: "kk" },
  { id: "whoa_3", label: "Whoa Whoa / I’m goin’ for the prize", lane: "mk_optional" },
  { id: "ch3", label: "Ch3", lane: "kk" },
  { id: "outro", label: "Outro", lane: "kk" }
];

function hasRealKK(combo) {
  return combo.some(s => s.lane === "kk");
}

function isWhoaOnly(combo) {
  return combo.every(s => s.lane === "mk_optional");
}

function hasAtLeastTwoMajorKKs(combo) {
  return combo.filter(s => s.lane === "kk").length >= 2;
}

function role(combo) {
  const ids = combo.map(s => s.id);
  if (ids.includes("intro")) return "opening_drive";
  if (ids.includes("v1a") || ids.includes("v1b") || ids.includes("ch1")) return "first_act_claim_the_crown";
  if (ids.includes("v2") || ids.includes("ch2")) return "battle_body";
  if (ids.includes("ch3") || ids.includes("outro")) return "late_resolution";
  return "general_contiguous_span";
}

const combos = [];

for (let i = 0; i < sections.length; i++) {
  for (let j = i; j < sections.length; j++) {
    const combo = sections.slice(i, j + 1);

    if (!hasRealKK(combo)) continue;
    if (isWhoaOnly(combo)) continue;
    if (!hasAtLeastTwoMajorKKs(combo)) continue;

    combos.push({
      combo_id: `sandman_combo_${String(combos.length + 1).padStart(2, "0")}`,
      pix: "Sandman's Comin'",
      start_section: combo[0].id,
      end_section: combo[combo.length - 1].id,
      section_count: combo.length,
      kk_section_count: combo.filter(s => s.lane === "kk").length,
      mk_optional_section_count: combo.filter(s => s.lane === "mk_optional").length,
      role: role(combo),
      title: combo.map(s => s.label).join(" → "),
      sections: combo,
      rule: "contiguous KK-combo candidate; original order preserved; no skipped sections; Whoa sections are not standalone KK-combos"
    });
  }
}

const recommended = combos.filter(c =>
  [
    "Intro → Whoa Whoa → V1a → Break / Bridge",
    "V1a → Break / Bridge → Whoa Whoa → V1b → Echo — so I can claim the crown → Ch1",
    "V2 → Echo — the only fear I have → Ch2 → Whoa Whoa / I’m goin’ for the prize → Ch3 → Outro",
    "V1b → Echo — so I can claim the crown → Ch1",
    "Ch2 → Whoa Whoa / I’m goin’ for the prize → Ch3 → Outro"
  ].includes(c.title)
);

const out = {
  created_at: new Date().toISOString(),
  pix: "Sandman's Comin'",
  doctrine: {
    allowed_object_types_for_this_lane: ["PIX", "KK", "KK-Combo"],
    mk_allowed_in_kk_combo_lane: false,
    whoa_handling: "Whoa sections may be set aside for mK lane. They may appear inside a larger contiguous KK-combo only when structurally between KK sections, but never as standalone KK-combos.",
    combo_rule: "contiguous sections only; original order preserved; no skipped sections; no arbitrary time slicing"
  },
  section_map: sections,
  recommended_first_pass: recommended,
  all_valid_contiguous_combo_options: combos
};

fs.writeFileSync("manifests/sandman-kk-combo-options.json", JSON.stringify(out, null, 2));

const md = [
  "# Sandman's Comin' — KK-Combo Options",
  "",
  "## Doctrine",
  "",
  "- PIX: Sandman's Comin'",
  "- KK-Combo: contiguous approved KK sections only",
  "- Whoa sections: set aside for mK lane unless naturally inside a larger contiguous combo",
  "- No standalone Whoa KK-Combo",
  "- No mKs in this lane",
  "- No skipped sections",
  "- No reordered sections",
  "",
  "## Recommended first-pass KK-Combos",
  "",
  ...recommended.map((c, idx) => `${idx + 1}. ${c.title}`),
  "",
  "## All valid contiguous KK-Combo options",
  "",
  ...combos.map((c) => `- ${c.combo_id}: ${c.title}`)
].join("\n");

fs.writeFileSync("docs/kk-combos/sandman-kk-combo-options.md", md);

console.log("section count:", sections.length);
console.log("recommended first pass:", recommended.length);
console.log("all valid combos:", combos.length);
console.log("wrote manifests/sandman-kk-combo-options.json");
console.log("wrote docs/kk-combos/sandman-kk-combo-options.md");
