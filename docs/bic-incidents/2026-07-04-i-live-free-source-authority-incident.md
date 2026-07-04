# BIC Incident Audit — I Live Free Source-Authority Failure

Date: 2026-07-04  
Project: K-KUT / 4PE-KKr / GPM Release Gate  
Incident severity: BIC-level release-safety incident  
Public route affected: `/i-live-free-july4`  
Current disposition: EMERGENCY HOLD / PUBLIC ROUTE OFFLINE  
Hold commit: `d50fcaf` — `Emergency hold I Live Free promo pending source-authority audit`

## Executive finding

The I Live Free July 4 promo route was incorrectly populated from audio that was not proven by BIC-level source authority.

The failure was not merely a bad trim. The failure was that title/path search and approximate filename matching were allowed to qualify candidate audio for public release.

This is forbidden.

## What failed

The workflow allowed these unsafe assumptions:

1. A path or filename containing `I_LIVE_FREE`, `i live free`, `free`, or related title text was treated as release evidence.
2. Review-wrapper WAVs were mistaken for actual KKs.
3. Private/rendered batch audio was treated as possible public release material.
4. Duration similarity was treated as enough to proceed.
5. The deployment step proceeded without exact source-authority binding to:
   - canonical title,
   - work item / track ID,
   - source WAV/lossless parent,
   - parent hash,
   - TPR/CDR/II Approval row,
   - DP PCK release gate,
   - GD final listening approval.
6. GD later identified the live audio as wrong-title audio / Pat Tennessee material, not I Live Free.

## Bad / unsafe paths observed

The following paths were involved in the bad selection chain or were flagged as unsafe evidence. These are not sufficient for public deploy authority.

### Private rendered / do-not-ship path

`/Users/gputnammusicllc/GPM_LOCAL_VAULT/09_Registry/4PE_KKr_RUN_STL_311/108_II_APPROVAL_NEXT_BATCH_HOLIDAY_FOUNDATION/PRIVATE_RENDERED_AUDIO_BATCH_DO_NOT_SHIP/sentimeants/karekut/SIM_AUDIO_aa52381561c0bcefa0/karekut-015-8c65c871__SIM_AUDIO_aa52381561c0bcefa0.mp3`

Reason blocked:

- path contains `PRIVATE_RENDERED_AUDIO_BATCH_DO_NOT_SHIP`;
- not a public release source path;
- not proven by source-authority binding;
- GD listener reported wrong-title content.

### Candidate playback review-only path

`/Users/gputnammusicllc/GPM_LOCAL_VAULT/09_Registry/4PE_KKr_RUN_STL_311/50_GD_PRODUCT_REVIEW_CANDIDATE_PLAYBACK_SAFE_PUBLIC_TITLES/GD_PRODUCT_REVIEW_CANDIDATE_PLAYBACK_20260630T223240Z/CANDIDATE_AUDIO_CLIPS_REVIEW_ONLY/shortKUT_0238_39__17.996.wav`

Reason blocked:

- review-only path;
- filename does not itself prove source authority;
- not enough proof for public release without registry binding and listening.

### Full / wrapper WAVs mistakenly used earlier

`/Users/gputnammusicllc/GPM_LOCAL_VAULT/09_Registry/4PE_KKr_RUN_STL_311/49_GD_PRODUCT_REVIEW_WORKBENCH_AUDIO_RESOLVED/GD_PRODUCT_REVIEW_AUDIO_RESOLVED_20260630T222704Z/AUDIO_REVIEW_CACHE_CONTROLLED/50__KareKUT__I_LIVE_FREE__238_-_Brianna_Shelko_-_I_LIVE_FREE.wav`

`/Users/gputnammusicllc/GPM_LOCAL_VAULT/09_Registry/4PE_KKr_RUN_STL_311/49_GD_PRODUCT_REVIEW_WORKBENCH_AUDIO_RESOLVED/GD_PRODUCT_REVIEW_AUDIO_RESOLVED_20260630T222704Z/AUDIO_REVIEW_CACHE_CONTROLLED/50__shortKUT__I_LIVE_FREE__238_-_Brianna_Shelko_-_I_LIVE_FREE.wav`

Reason blocked:

- full/wrapper duration approximately 149.753s;
- not individual KK excerpts;
- cannot be used as public KK files.

### Explicit mismatch path

`/Users/gputnammusicllc/GPM_LOCAL_VAULT/09_Registry/4PE_KKr_RUN_STL_311/49_GD_PRODUCT_REVIEW_WORKBENCH_AUDIO_RESOLVED/GD_PRODUCT_REVIEW_AUDIO_RESOLVED_20260630T222704Z/AUDIO_REVIEW_CACHE_CONTROLLED/50__sK_rhyme_review__I_LIVE_FREE__50_-_Michael_Scherer_-_SUNDAY_AFTERNOON_-_INSTRO_bpm.wav`

Reason blocked:

- path contains I Live Free but actual file name identifies Sunday Afternoon INSTRO;
- explicit cross-title mismatch;
- must never be eligible for I Live Free.

## Emergency response completed

The public I Live Free promo page and audio were removed.

Removed files:

- `app/i-live-free-july4/page.tsx`
- `public/i-live-free-july4/audio/i-live-free-karekut-dp-sti.mp3`
- `public/i-live-free-july4/audio/i-live-free-shortkut-dp-sti.mp3`

Hold commit:

`d50fcaf Emergency hold I Live Free promo pending source-authority audit`

Post-hold live verification:

- `/i-live-free-july4` returned HTTP 404.
- `/foundation-july4` returned HTTP 200.

## BIC root cause

The root cause was a missing source-authority release gate.

A filename/title/path hit was allowed to substitute for the required proof chain. That is not BIC.

## New hard rule

No title search, filename search, fuzzy match, folder match, duration match, holiday label, or sentiment tag may authorize public audio.

A deployable KK requires exact source-authority proof.

## Required proof chain before any future public KK deploy

Every public KK must prove all of the following:

1. `canonical_track_title` exact match.
2. `kkr_work_item_number` / track ID exact match.
3. `source_file_name` exact match.
4. Parent WAV/lossless path exact match.
5. Parent WAV/lossless SHA/hash match.
6. TPR row exact match.
7. CDR or equivalent confirmation row exact match.
8. II Approval or explicit GD final approval exact match.
9. Candidate source path must not include:
   - `PRIVATE`
   - `DO_NOT_SHIP`
   - `REVIEW_ONLY`
   - `CANDIDATE_AUDIO_CLIPS_REVIEW_ONLY`
   - unrelated title names
   - unrelated artist names
10. Output duration must equal:
    - TPR/CDR source window duration,
    - plus approved DP front padding,
    - plus approved DP end cushion,
    - plus canonical GPM STI Twinkle duration.
11. GD must listen to final public-route audio before final release confirmation.

## BIC status

This incident is accepted as a BIC-level release-safety failure.

I Live Free remains on HOLD until a new source-authority audit proves correct KK files.

