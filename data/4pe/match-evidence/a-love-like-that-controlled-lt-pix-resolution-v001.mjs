// Authoritative controlled lossless-parent resolution for A Love Like That.
// This resolves source identity only. It does not approve boundaries, meaning, matching, rendering, sale, or public release.

export const A_LOVE_LIKE_THAT_CONTROLLED_SOURCE_PATH =
  "/Users/gputnammusicllc/GPM_LOCAL_VAULT/09_Registry/DISCO_MASTER_DOWNLOADS/02_CONTROLLED_WAV_DOWNLOAD_INBOX/BULK_DISCO_CURRENT_NEW_UNIQUE_ZIPS_EXTRACT_20260625-233352/G Putnam Music, LLC - Shine the Light (STL) - GPM Inventory 07-22-26 (4)/G Putnam Music, LLC - Shine the Light (STL) - GPM Inventory 07-22-26/296 - Lloyd G Miller - A LOVE LIKE THAT.wav";

export const A_LOVE_LIKE_THAT_SOURCE_SHA256 =
  "0b05e40b1421665770d748242325a08e2c7d4fdd94757a43f57c3142d1839a80";

export const aLoveLikeThatControlledLtPixResolution = {
  resolution_id: "allt-105529524-controlled-lt-pix-v001",
  resolution_date: "2026-07-15",
  canonical_title: "A Love Like That",
  performing_artist: "Lloyd G Miller",
  pix_handle: "ALLT-105529524",
  source_stl_id: "105529524",
  lt_pix_id: "LTPIX_0121",
  object_type: "LT-PIX",
  source_format: "WAV",
  controlled_source_filename: "296 - Lloyd G Miller - A LOVE LIKE THAT.wav",
  controlled_source_path: A_LOVE_LIKE_THAT_CONTROLLED_SOURCE_PATH,
  source_sha256: A_LOVE_LIKE_THAT_SOURCE_SHA256,
  source_identity_status: "RESOLVED_LOCKED_LOSSLESS_PARENT",
  authority_evidence: {
    registry_path: "/Users/gputnammusicllc/GPM_LOCAL_VAULT/09_Registry/4PE_KKr_RUN_STL_311/89_SELECT_ONE_NOT_APPROVED_LTPIX_CONTAINER_FOR_TPR/01_NOT_APPROVED_LTPIX_TPR_SELECTION_LIST_20260701T184513Z.csv",
    registry_row: 3,
    registry_status: "READY_PICK_ONE_NOT_APPROVED_LTPIX_FOR_TPR",
    registry_parent_status: "NEEDS_TPR_BEFORE_KK_DERIVATION",
    required_action: "BUILD_ONE_CONTAINER_TPR_WORKSET_FROM_LOCKED_PARENT_AUDIO",
    blocking_status: "BLOCKED_UNTIL_TPR_CDR_LOCKS_KK_BOUNDARIES",
    controlled_download_batch: "BATCH_007",
    controlled_download_item: 121
  },
  remaining_holds: [
    "MIAL_ROW_ID_NOT_LINKED",
    "RENDITION_PERFORMANCE_ID_NOT_ASSIGNED",
    "TPR_CDR_KK_BOUNDARIES_NOT_LOCKED",
    "EXACT_AUDIBLE_WORDS_NOT_VERIFIED",
    "RIGHTS_EVIDENCE_NOT_COMPLETED",
    "MATCH_MEANING_NOT_REVIEWED",
    "GD_MATCH_DECISION_PENDING",
    "FINAL_CANONICAL_TWINKLE_PACKAGE_NOT_RENDERED"
  ],
  release_law: "Controlled source resolution does not approve a KK, customer-need match, II, package, checkout, or public route."
};

export function applyALoveLikeThatControlledLtPixResolution(baseProfile) {
  return {
    ...baseProfile,
    source_lineage_resolution: {
      ...baseProfile.source_lineage_resolution,
      resolution_status: "CONTROLLED_LT_PIX_PARENT_RESOLVED_TPR_REQUIRED",
      resolution_date: aLoveLikeThatControlledLtPixResolution.resolution_date,
      mial_lineage: {
        ...baseProfile.source_lineage_resolution?.mial_lineage,
        status: "LT_PIX_ID_RESOLVED_MIAL_ROW_ID_NOT_LINKED",
        pix_handle: aLoveLikeThatControlledLtPixResolution.pix_handle,
        source_stl_id: aLoveLikeThatControlledLtPixResolution.source_stl_id,
        lt_pix_id: aLoveLikeThatControlledLtPixResolution.lt_pix_id,
        mial_record_id: null
      },
      controlled_lt_pix: {
        status: "RESOLVED_LOCKED_PARENT_AUDIO_TPR_REQUIRED",
        lt_pix_id: aLoveLikeThatControlledLtPixResolution.lt_pix_id,
        object_type: aLoveLikeThatControlledLtPixResolution.object_type,
        source_format: aLoveLikeThatControlledLtPixResolution.source_format,
        controlled_source_filename: aLoveLikeThatControlledLtPixResolution.controlled_source_filename,
        controlled_source_path: aLoveLikeThatControlledLtPixResolution.controlled_source_path,
        source_sha256: aLoveLikeThatControlledLtPixResolution.source_sha256,
        authority_registry_path: aLoveLikeThatControlledLtPixResolution.authority_evidence.registry_path,
        authority_registry_row: aLoveLikeThatControlledLtPixResolution.authority_evidence.registry_row,
        next_gate: aLoveLikeThatControlledLtPixResolution.authority_evidence.blocking_status
      },
      rendition_reconciliation: {
        ...baseProfile.source_lineage_resolution?.rendition_reconciliation,
        status: "CONTROLLED_WAV_PARENT_SELECTED_HISTORICAL_MP3_ALIAS_RECONCILIATION_REMAINS",
        selected_controlled_parent: {
          canonical_title: aLoveLikeThatControlledLtPixResolution.canonical_title,
          performing_artist: aLoveLikeThatControlledLtPixResolution.performing_artist,
          lt_pix_id: aLoveLikeThatControlledLtPixResolution.lt_pix_id,
          source_path: aLoveLikeThatControlledLtPixResolution.controlled_source_path,
          source_sha256: aLoveLikeThatControlledLtPixResolution.source_sha256
        }
      }
    },
    lt_pix_id: aLoveLikeThatControlledLtPixResolution.lt_pix_id,
    controlled_source_path: aLoveLikeThatControlledLtPixResolution.controlled_source_path,
    source_sha256: aLoveLikeThatControlledLtPixResolution.source_sha256,
    object_type: aLoveLikeThatControlledLtPixResolution.object_type,
    source_authority_status: "RESOLVED_CONTROLLED_LOSSLESS_PARENT_TPR_REQUIRED"
  };
}
