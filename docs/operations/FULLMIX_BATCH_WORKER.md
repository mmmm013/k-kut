# Private FullMix batch copy-capture worker

The deployed next-run claimant does not render audio. This offline worker provides
the private copy-capture execution stage for all 324 current FullMix sources.
It is not wired to the deployed claimant and does not replace musical analysis,
owner review, II assembly, storage authentication, or publication.

Run with Python 3.10+ on the authenticated production host after that host exports
the current inventory and reviewed evidence and downloads source clones:

```sh
python3 scripts/kkr/build-fullmix-inventory.py /private/run/inventory.json --output /private/run/build
python3 scripts/kkr/test_fullmix_inventory.py
```

The worker has no network or database writes. It never edits SSOTs, invents URLs,
chooses musical boundaries, assigns headings, or promotes eligibility. PCM WAV is
supported; other encodings remain triage. The source file is copied unchanged;
captures contain exactly the source PCM frames in the locked interval, preserving
sample rate, channel count and sample width. Capture WAV container metadata is new.

## Trusted input boundary

Supply an operator-controlled export of current membership and previously reviewed
evidence. Input files must remain private and immutable while the job runs. Hashes
prove that the supplied bytes match their references, not that statements in those
files are true. This worker does not turn unreviewed statements into authority.
Do not build these files by asserting that all checks passed. Export the actual
verified authority records; absent records must remain absent.

`inventory.json` has schema `FULLMIX_PRIVATE_BUILD_V1`, the authoritative
`current_fullmix_track_ids` array, and `members`. Exactly 324 unique source IDs and
FM IDs are required. Each member has `source_track_id`, `fm_id`,
`inventory_lane: FULLMIX`, and optional `local_source: {path, sha256}`. Title text
never changes membership. Missing source files retain their inventory entries.
All referenced files must reside below the directory containing the inventory.

Each member's optional `proof` object references five JSON evidence files by
`{path, sha256}`: `source_authority`, `rights_lineage`, `complete_transcript`,
`full_source_listening`, and `locked_blk_map`. The first four must contain their
actual `verification_record_ref`, `verification_state: VERIFIED`, and matching
`source_track_id`, `fm_id`, and `source_sha256`. Transcript evidence additionally
references its nonempty transcript text file as `transcript: {path, sha256}`.

The locked BLK map contains matching source identities and SHA-256, `state: LOCKED`,
the source `sample_rate`, and sequential `blocks` with `id`, `start_frame`, and
`end_frame`. End frames are exclusive. Use reviewed sample-frame boundaries; do not
derive them from durations, quotas, headings, or arbitrary windows. Optional
`kombos` explicitly lists approved consecutive BLK IDs. A KOMBO is one continuous
source capture spanning the first start to the last end, including source audio
between them; it never splices separated sections together.

## Outputs and continuation

Outputs are private, content-addressed source copies, capture WAVs, and an immutable
receipt containing all 324 members. Existing different bytes cause a conflict;
identical replays reuse the existing object. Evidence changes produce new capture
identities. A failed member does not remove other members or halt their work.

The receipt records `PCM_VERIFIED_PENDING_MUSICAL_REVIEW` for captured items.
PCM equality does not verify onset, last vocal note, musical resolution, or adjacent
section trespass. Complete those listening checks, then supported headings and owner
review. Only afterward may controlled eligibility be recorded. IIs still require
the governed finished delivery assembly. No output here is a finished II, and the
worker never writes to public application audio.

Rerun the same command when authentic source copies or reviewed evidence arrive.
Old receipts and audio remain intact. A zero capture count is not a completed
inventory build and must not be reported as one.
