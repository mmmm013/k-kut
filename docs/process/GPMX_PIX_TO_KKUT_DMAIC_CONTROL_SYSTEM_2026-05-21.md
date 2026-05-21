# GPMx PIX → K-KUT DMAIC Control System

## Status

Operating doctrine for disciplined, measurable, repeatable PIX-to-K-KUT processing.

This document exists because the system has moved past one-off fixes. The work is now routine process control.

## Core Judgment

Yes: GPMx should re-process the PIX catalog into K-KUTs under the refined process.

But it should not be done as one giant uncontrolled rebuild.

It should be run as a controlled DMAIC pipeline:

1. Define
2. Measure
3. Analyze
4. Improve
5. Control

The goal is not merely to create more KUTs. The goal is to create reliable, governed, display-ready, checkout-ready K-KUT inventory.

## Why Re-Processing Is Necessary

Recent failures show the catalog has mixed states:

- source PIX exists but KUTs do not
- product doctrine exists but launch rows are wrong
- broad tags allow unrelated songs to leak into public pages
- source-backed fallbacks can become fake options if section timing is missing
- checkout can route without preserving exact selected KUT/source
- some pages show categories before the underlying playable inventory is ready

These are process defects, not creative failures.

## Six Sigma Rule

A public K-KUT option is not real until it has:

1. an approved source PIX,
2. an approved section definition,
3. playable audio or approved start/end timing,
4. metadata tying it back to source,
5. release status,
6. checkout/fulfillment preservation,
7. test proof.

## Universal Process Types

There are only a few repeatable process states:

1. Intake source PIX
2. Classify PIX
3. Map song sections
4. Select KUT candidates
5. Materialize KUT audio or exact timing
6. Verify audio
7. Seed launch display
8. Route checkout
9. Test public page
10. Commit proof and monitor

Every PIX and every promo should move through these same gates.

## DMAIC Model

### Define

For each PIX or promo, define:

- source title
- source path / storage object
- owner / artist / catalog identity
- allowed promo lanes
- disallowed promo lanes
- allowed KUT options
- customer-facing title
- checkout tier
- fulfillment type
- public page path
- status

Example:

- Promo: Forever & A Day Wedding Track Pack
- Approved source PIX: Forever & A Day.mp3
- Allowed options: Intro, Verse 1, Chorus 1, Verse 1 + Chorus 1, Verse 2, Bridge to Chorus, Final Chorus, Final Chorus + Outro
- Disallowed: Empty Space, Be Mine Tonight, Walkin' After Midnight, Further Away, unrelated wedding-like songs
- Page: /personal/wedding
- Rule: one wedding song, multiple approved KUTs from that one song

### Measure

For each source or promo, measure:

- source exists
- source plays
- duration known
- section map exists
- KUT files exist
- KUT files play
- KUT rows exist
- QC rows exist
- launch rows exist
- launch rows are clean
- checkout routes correctly
- public page displays correctly

### Analyze

Classify defects into standard buckets:

- source missing
- source path broken
- section map missing
- KUT audio missing
- KUT row missing
- QC missing
- launch seed wrong
- broad tag contamination
- checkout route wrong
- fulfillment preservation missing
- public page copy wrong
- fake audio option
- stale local server / env issue

### Improve

Apply the correct fix:

- source missing → locate/upload source
- section map missing → create section map
- KUT audio missing → cut/materialize KUT
- QC missing → verify and write QC
- launch seed wrong → deactivate/quarantine bad rows
- broad tag contamination → hard-gate source/promo
- checkout wrong → route product/source/kut
- fake option → hide audio/checkout until real

### Control

Prevent recurrence:

- no active launch row without approved source match
- no public KUT option without playable audio or exact timing
- no checkout button for pending candidates
- no broad tag-based promo pages without a source allowlist
- no unrelated song in a one-song promo
- every promo page has a release checklist
- every defect is logged against one of the standard buckets

## Release States

Use these states consistently:

- `raw_source`
- `source_verified`
- `section_map_pending`
- `section_mapped`
- `kut_candidate`
- `kut_materialized`
- `audio_verified`
- `launch_seeded`
- `checkout_ready`
- `public_live`
- `quarantined`
- `retired`

## Hard Public Display Rules

### Rule 1 — No Fake Choice

Do not display multiple playable options if they all point to the same full source audio unless clearly labeled as a single reference listen.

### Rule 2 — No Broad Promo Leakage

A promo page must not pull unrelated songs simply because they match broad words like wedding, love, birthday, sorry, or forever.

### Rule 3 — Source-Gated Promos

For one-song promos, the source allowlist is mandatory.

Example:

- Wedding Promo allowlist: Forever & A Day only.

### Rule 4 — Pending Is Allowed If Honest

Pending section choices may be visible only when clearly labeled as pending and not checkout-ready.

### Rule 5 — Checkout Means Fulfillable

A checkout button means the selected option can be fulfilled. If the KUT is pending, the checkout action must be disabled or routed to a reviewed inquiry/order flow.

## PIX Re-Processing Strategy

Do not reprocess all ~800 PIX as one chaotic rebuild.

Run in batches:

### Batch 1 — Revenue / public proof

- Forever & A Day
- Best Birthday
- Best Birthday - Long
- Awesome Anniversary
- I’m Sorry / apology assets
- Thank You candidates
- Encouragement candidates

### Batch 2 — Greeting-card coverage

- Thinking of You
- Just Because
- Sympathy
- Get Well
- Congratulations
- Graduation
- New Baby
- Friendship
- Family

### Batch 3 — KFS / Awesome Squad

- kids birthday
- classroom
- family singalong
- encouragement
- child/family-safe uses

### Batch 4 — Long tail

- remaining catalog by category, quality, rights, and market fit

## Required Output Per PIX

Each processed PIX should produce:

1. source manifest entry
2. section map
3. KUT candidate list
4. materialized KUT file list or timing list
5. QC status
6. allowed promo lanes
7. disallowed promo lanes
8. public title/copy candidates
9. checkout tier
10. release status

## Required Output Per Promo

Each promo should produce:

1. promo definition
2. approved source allowlist
3. approved KUT option list
4. active launch rows
5. quarantined bad rows
6. checkout route
7. public page proof
8. monitoring metrics

## Immediate Priority

1. Quarantine bad wedding launch rows.
2. Create Forever & A Day section map.
3. Materialize or time-map Forever & A Day Wedding KUTs.
4. Seed only those KUTs into `k_kut_launch_audio` for `slug=wedding`.
5. Ensure `/personal/wedding` shows only real playable Forever & A Day KUTs or honest pending section choices.
6. Repeat same discipline for Birthday, Anniversary, Apology, Thank You, and Encouragement.

## Mantra

One promo.
One approved source set.
Known KUT options.
Verified audio.
Correct checkout.
Proof or pending.
