// Controlled resolution of the sole LTPIX_0121 wording hold.
// This is evidence, not a customer-match approval or public-release approval.

export const A_LOVE_LIKE_THAT_L04_WORDING_RESOLUTION_ID =
  "allt-l04-exact-audible-wording-v001";

export const aLoveLikeThatL04WordingResolution = {
  resolution_id: "allt-l04-exact-audible-wording-v001",
  record_date: "2026-07-15",
  line_id: "ALLT-L04",
  source_line_number: 4,
  section_id: "KK-ALLT-105529524-S01",
  lt_pix_id: "LTPIX_0121",
  controlled_source_sha256:
    "0b05e40b1421665770d748242325a08e2c7d4fdd94757a43f57c3142d1839a80",
  tpr_start_seconds: 23.062993,
  cdr_end_seconds: 25.797007,
  start_frame: 1017078,
  end_frame: 1137648,
  exact_audible_wording:
    "That's lookin' back - since then he's flashed",
  source_text_sha256:
    "ea72079286ecf270c5b838487dddcda369d200e00ddae5e6f6e46bf1bde74cc7",
  normalized_lexical_sha256:
    "12974a97d8e8a53e58ca5bbd676ea0838852f344c709f931a7dc2919b9aa7cd2",
  resolution_status: "LOCKED_EXACT_AUDIBLE_WORDING_CONTROLLED_WAV",
  confidence: "HIGH",
  evidence: {
    source_metadata_repetitions: 2,
    source_metadata_exact_match: true,
    robust_forced_alignment_variant_count: 18,
    source_beats_years_flashed_variants: 18,
    source_beats_years_passed_variants: 18,
    subject_pronoun_result: "HES_SUPPORTED_OVER_YEARS",
    final_word_result:
      "PRE_VOWEL_FRICATION_LIQUID_AND_POST_VOWEL_FRICATION_STOP_SUPPORT_FLASHED",
    editorial_alternatives_rejected: [
      "years flashed",
      "years passed",
      "he's passed",
      "he's back"
    ],
    law:
      "Preserve the unusual authored/audible wording. Do not normalize it into a more conventional phrase."
  }
};

export function applyALoveLikeThatL04WordingResolution(baseLock) {
  const lineAlignments = baseLock.line_alignments.map((row) =>
    row.line_id === "ALLT-L04"
      ? {
          ...row,
          exact_word_status:
            "LOCKED_SOURCE_LEXICAL_SEQUENCE_ALIGNED_TO_CONTROLLED_WAV",
          exact_audible_wording_ref:
            A_LOVE_LIKE_THAT_L04_WORDING_RESOLUTION_ID,
          note:
            "Exact audible wording resolved from source authority plus controlled-WAV acoustic evidence."
        }
      : row
  );

  return {
    ...baseLock,
    alignment_authority: {
      ...baseLock.alignment_authority,
      line_status_summary: {
        locked_lexical_sequences: 37,
        wording_holds: 0,
        section_tpr_cdr_locks: 7
      }
    },
    line_alignments: lineAlignments,
    l04_wording_resolution: aLoveLikeThatL04WordingResolution
  };
}
