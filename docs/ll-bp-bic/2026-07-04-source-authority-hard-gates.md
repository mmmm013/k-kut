# Source Authority Hard Gates for Public K-KUT Release

Date locked: 2026-07-04  
Applies to: K-KUT, KKr, 4PE, II Approval, DP PCK, public promo deploys  
Status: BIC-level hard gate

## Rule

No public K-KUT audio may be deployed from title search, filename search, path search, fuzzy match, duration match, holiday/sentiment tag, or presumed identity.

## Absolute release requirement

Public deploy requires a source-authority proof chain.

A KK, sK, mK, NakedKK, II, or DP file is not public-release eligible unless all required proof fields are present and match.

## Required fields

Each release item must bind to:

- canonical track title
- artist / performer metadata where applicable
- work item number / track ID
- parent source WAV/lossless path
- parent source WAV/lossless SHA or approved source hash
- source file name
- TPR row ID
- CDR row ID or confirmation row
- II Approval / GD final approval row
- DP PCK release package record
- final public path
- final public duration
- final public hash

## Forbidden source paths

Files from these paths or path markers are never public-release authority by themselves:

- `PRIVATE`
- `DO_NOT_SHIP`
- `REVIEW_ONLY`
- `CANDIDATE_AUDIO_CLIPS_REVIEW_ONLY`
- `PRIVATE_RENDERED_AUDIO_BATCH_DO_NOT_SHIP`
- `AUDIO_REVIEW_CACHE_CONTROLLED`
- temporary browser downloads
- local scratch directories
- generated review-room audio not bound to registry rows

These may be evidence only. They are not release authority.

## Cross-title hard stop

If a candidate path contains one title but the filename, registry row, source parent, performer, or listened audio indicates another title, the item must immediately go to HOLD.

No public deploy may proceed until reconciled.

## Listener override

GD listening mismatch overrides all metadata.

If GD hears wrong title, wrong artist, wrong version, wrong source, wrong section, or wrong product family, the item is HOLD immediately.

## DP PCK rule

DP happens at process end.

DP PCK may only consume approved source-authority KKs. DP PCK may not rescue or legitimize an unproven KK.

## Deployment gate

Before public deploy, a script or human checklist must verify:

1. No staged unrelated files.
2. No unrelated dirty worktree files are included.
3. Exact files only are staged.
4. Public audio hash and duration are recorded.
5. Final public URL is verified.
6. Final public audio is listened to by GD.

## BIC decision

This hard gate is locked because a July 4 I Live Free deploy incorrectly used unproven/wrong audio candidates.

