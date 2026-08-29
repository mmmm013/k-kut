# FAAD KUT Decision Ledger V1

## Authority

- Track: `Forever & a Day`
- Track authority initials: `FAAD`
- Owner/decision authority: Gregory D. Putnam
- Repository: `mmmm013/k-kut`
- Vercel project: `g-putnam-music/k-kut`

This ledger captures decisions. It does not replace the full source audio as boundary authority.

## Event-layer correction

- `Labor Day`, not `Memorial Day`.
- A holiday is an event/container layer only.
- Holiday naming must not change FAAD, BLK, KOMBO, K-KUT, or audio identity.

## BLK and KOMBO boundary law

- Use only `FAAD-BLK1` through `FAAD-BLK6` and the approved FAAD KOMBO identities as cutting/prosecution authority.
- Never cut off a VTP.
- Never infer a BLK end from the next BLK start.
- A KOMBO starts at the exact start of its first included BLK.
- A KOMBO ends at the exact end of its last included BLK.
- Clock times are locators only until Gregory locks a boundary.
- The full source audio is authority; a derived or public K-KUT is not boundary authority.

## KKr text-review law

The repeated review is slow review, not double-speed playback:

1. Run the text review at `1/4 speed`.
2. Run the same `1/4-speed` review again.
3. Run the same `1/4-speed` review a third time.
4. Mark issues `STAGED` or `TRIAGED`.
5. Mark `LOCKED` only after proof and Gregory's approval.

Status meanings:

- `STAGED`: likely correct, awaiting proof, listening, or authority.
- `TRIAGED`: conflict, error, uncertainty, or customer-facing risk.
- `LOCKED`: Gregory-approved after the repeated slow text verification.

## KOMBO Field Test 1

- Internal identity: `FAAD-KOMBO-BLK3-BLK4-FIELD-TEST-1`
- Field-test source audio: `public/ii-delivery/wedding/faad/FAAD-KOMBO-BLK3-BLK4-FIELD-TEST-1.mp3`
- Field-test source SHA-256: `d3de2b3fe24d046a5ae61bc7c89fbd526e5d0464dbb21bfc5e2891d80719bf87`
- DP playback audio: `public/ii-delivery/wedding/faad/FAAD-KOMBO-BLK3-BLK4-FIELD-TEST-1-DP.mp3`
- DP playback SHA-256: `1d47b3ca9bc26c4f01d7fd04443df894700a510863ff80eb22a864c0ecec4e35`
- Duration: `89.051429` seconds for each field-test file.
- DP treatment: 1-second fade-in and 500-millisecond fade-out.
- Wedding Twinkle: silent.
- Status: field test only; not final `FAAD-KOMBO-BLK3-BLK4` boundary doctrine.

Final `FAAD-KOMBO-BLK3-BLK4` still requires exact `FAAD-BLK3_START` through exact `FAAD-BLK4_END`, with no BLK2 residue, no BLK5 trespass, and no VTP cutoff.

## Customer-facing meaning lock

Internal prosecution terms must not be the primary customer meaning headings.

Locked recipient display:

- Title: `Forever & a Day`
- Description: `A private wedding music moment sent just for you.`
- Words heading: `Thinking of where we have been`
- Promise heading: `The promise that remains`

The words heading must say `where we have been`, never `where you have been`.

The recipient screen must include the audio player, words, `Forward this`, `Copy this HUG link`, `Send your own`, and stream-only/no-download language.

The recipient screen must not expose `Memorial Day`, `Mother's Day`, `mothers-day`, internal BLK headings as primary customer meaning, `Review hold`, `A Love Like That`, or `not sendable`.

## Recovery evidence — 2026-08-29

The ready Preview deployment `dpl_BDAfZ6bLQM21G26ZNB6bwF9QVsxN` reported CLI source commit `213ccf1e95110c03f6a665b8ed7b7b288f8425ee` with message `Lock corrected KKr text review repeat-pass law` and `gitDirty=1`.

That local commit object was not present on GitHub when recovery began. The recipient route and both field-test audio files were recovered from the ready Preview and added to the repository branch `faad-recipient-meaning-dp` before further editing.
