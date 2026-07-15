// Controlled lyric-evidence status for A Love Like That.
// The complete lyric text remains in controlled source evidence and is not duplicated here.
// Exact audible-word proof requires alignment to LTPIX_0121.

import {
  A_LOVE_LIKE_THAT_CONTROLLED_SOURCE_PATH,
  A_LOVE_LIKE_THAT_SOURCE_SHA256,
} from "./a-love-like-that-controlled-lt-pix-resolution-v001.mjs";

export const A_LOVE_LIKE_THAT_LYRIC_AUTHORITY_ID =
  "allt-105529524-lyric-authority-v001";

export const A_LOVE_LIKE_THAT_SOURCE_LYRIC_FINGERPRINT =
  "56ac367e1d136d9b5c176a5b372ba8383f9f4ada3f593332829469c880fe1aea";

export const aLoveLikeThatLyricAuthority = {
  lyric_authority_id: A_LOVE_LIKE_THAT_LYRIC_AUTHORITY_ID,
  record_date: "2026-07-15",
  canonical_title: "A Love Like That",
  performing_artist: "Lloyd G Miller",
  pix_handle: "ALLT-105529524",
  source_stl_id: "105529524",
  lt_pix_id: "LTPIX_0121",
  controlled_source_path: A_LOVE_LIKE_THAT_CONTROLLED_SOURCE_PATH,
  controlled_source_sha256: A_LOVE_LIKE_THAT_SOURCE_SHA256,
  authority_status: "PARTIAL_LYRIC_TEXT_LOCATED_CONTROLLED_AUDIO_ALIGNMENT_REQUIRED",
  lyric_text_status: "LOCATED_IN_OPERATING_SOURCE_METADATA_AND_STL_INTAKE_EVIDENCE",
  exact_audible_words_status: "PENDING_LINE_BY_LINE_CONTROLLED_WAV_ALIGNMENT",
  permanent_gpmc_mial_lyric_row_status: "NOT_LINKED",
  disco_lyric_page_status: "NOT_LOCATED_AS_SEPARATE_CURRENT_AUTHORITY_OBJECT",
  source_lyric_evidence: {
    line_count: 37,
    utf8_character_count: 1308,
    line_join_rule: "Join source lines with one LF character and no trailing LF.",
    sha256: A_LOVE_LIKE_THAT_SOURCE_LYRIC_FINGERPRINT,
    storage_rule: "The complete lyric text remains in controlled source metadata and intake evidence."
  },
  source_evidence: [
    {
      source_type: "OPERATING_PIX_SSOT_EMBEDDED_METADATA",
      source_object: "A_LOVE_LIKE_THAT_SB_TRACKS_SSOT.mp3",
      source_field: "lyrics-eng",
      evidence_status: "FULL_TEXT_LOCATED_NOT_AUDIO_ALIGNED"
    },
    {
      source_type: "STL_DISCO_DERIVED_INTAKE_EXPORT",
      source_object: "public/assets/stl.csv and GPM_STL_v4_PERFECT.csv",
      source_stl_id: "105529524",
      evidence_status: "TRACK_IDENTITY_AND_LYRIC_TEXT_LOCATED"
    }
  ],
  normalization_holds: [
    "SOURCE_TEXT_TYPO_REQUIRES_CONTROLLED_AUDIO_CONFIRMATION",
    "SOURCE_ARTIST_METADATA_DIFFERS_FROM_CONTROLLED_PARENT_ARTIST",
    "ORTHOGRAPHY_CONTRACTIONS_PUNCTUATION_REQUIRE_AUDIBLE_ALIGNMENT"
  ],
  historical_structure_evidence: {
    status: "PRIOR_GPMC_HUMAN_LISTEN_PASS_REVERIFY_AGAINST_LTPIX_0121",
    section_ids: [
      "KK-ALLT-105529524-S01",
      "KK-ALLT-105529524-S02",
      "KK-ALLT-105529524-S03",
      "KK-ALLT-105529524-S04",
      "KK-ALLT-105529524-S05",
      "KK-ALLT-105529524-S06",
      "KK-ALLT-105529524-S07"
    ],
    boundary_law: "A section includes the final sung word, resolving note, trailing ring or breath or decay, and the musical thought resolving before the next section begins.",
    current_control: "Prior timings cannot become current LTPIX_0121 boundaries until TPR and CDR comparison confirms the controlled WAV performance and locks natural vocal boundaries."
  },
  controlled_alignment_requirements: [
    "Confirm LTPIX_0121 is the same audible performance represented by the lyric metadata and prior listen proof.",
    "Align the controlled lyric text line by line to LTPIX_0121.",
    "Record audible deviations, omissions, repeats, ad-libs, and uncertain words.",
    "Resolve source-text discrepancies through controlled listening rather than editorial assumption.",
    "Map confirmed audible lines to KKr sections only after natural boundaries are locked.",
    "Keep exact-expression retrieval disabled until wording and section boundaries are proven."
  ],
  current_holds: [
    "MIAL_ROW_ID_NOT_LINKED",
    "RENDITION_PERFORMANCE_ID_NOT_ASSIGNED",
    "CONTROLLED_WAV_SAME_PERFORMANCE_CONFIRMATION_REQUIRED",
    "EXACT_AUDIBLE_WORD_ALIGNMENT_REQUIRED",
    "TPR_CDR_SECTION_BOUNDARIES_REQUIRED",
    "AUDIO_MEANING_PROFILE_NOT_APPROVED",
    "CUSTOMER_NEED_MATCHING_NOT_APPROVED",
    "GD_DECISION_PENDING",
    "FINAL_CANONICAL_TWINKLE_PACKAGE_NOT_RENDERED"
  ],
  release_law: "Located lyric text may support controlled analysis but cannot by itself create an exact-expression hit, prove a customer-need match, approve a KK, or release an II or package."
};

export function applyALoveLikeThatLyricAuthority(baseProfile) {
  return {
    ...baseProfile,
    lyric_authority_source: A_LOVE_LIKE_THAT_LYRIC_AUTHORITY_ID,
    lyric_text_status: aLoveLikeThatLyricAuthority.lyric_text_status,
    exact_audible_words_status: aLoveLikeThatLyricAuthority.exact_audible_words_status,
    lyric_source_line_count: aLoveLikeThatLyricAuthority.source_lyric_evidence.line_count,
    lyric_source_sha256: A_LOVE_LIKE_THAT_SOURCE_LYRIC_FINGERPRINT,
    exact_audible_words: null,
    source_lineage_resolution: {
      ...baseProfile.source_lineage_resolution,
      lyric_authority: {
        lyric_authority_id: A_LOVE_LIKE_THAT_LYRIC_AUTHORITY_ID,
        authority_status: aLoveLikeThatLyricAuthority.authority_status,
        lyric_text_status: aLoveLikeThatLyricAuthority.lyric_text_status,
        exact_audible_words_status: aLoveLikeThatLyricAuthority.exact_audible_words_status,
        permanent_gpmc_mial_lyric_row_status: aLoveLikeThatLyricAuthority.permanent_gpmc_mial_lyric_row_status,
        source_lyric_sha256: A_LOVE_LIKE_THAT_SOURCE_LYRIC_FINGERPRINT,
        normalization_hold_count: aLoveLikeThatLyricAuthority.normalization_holds.length,
        next_gate: "CONTROLLED_WAV_LINE_BY_LINE_ALIGNMENT_AND_TPR_CDR_SECTION_LOCK"
      }
    }
  };
}
