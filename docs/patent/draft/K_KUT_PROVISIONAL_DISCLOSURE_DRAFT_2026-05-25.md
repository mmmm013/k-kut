# Provisional Patent Disclosure Draft

## Working Title

Systems and Methods for Guided Song-Section Productization, Selection, Commerce, and Fulfillment

## Inventor / Applicant Notes

Inventor: Gregory Putnam / G Putnam Music
Project: K-KUT
Date: 2026-05-25

## Abstract

A computer-implemented system provides guided selection, productization, commerce, and fulfillment of exact song sections. A source audio work is presented to a user as a full-song reference, after which the system identifies selectable song sections and contiguous section combinations. A guided assistant, referred to as MC-BOT, recommends occasion-appropriate KKs/KUTs while preserving a complete governed menu of valid options. Each visible choice has a selectable state, but audio playback and checkout are gated until the exact selected section audio has been generated, reviewed, and approved. The system supports source-backed public rendering, audio verification, payment handoff, and fulfillment gating.

## Background

Users selecting music for personal occasions often need a specific emotional moment rather than an entire song. Existing systems typically offer full tracks, static previews, general playlists, or conventional greeting cards. They do not provide a governed user flow in which a person hears a source song, receives guided recommendations for exact song-section products, selects from solo sections or contiguous combinations, and purchases or sends an approved section-specific audio product.

## Summary of the Invention

The invention includes systems and methods for:

1. Presenting a full source song or source audio work to establish user context.
2. Mapping the source work into selectable song-section units.
3. Recommending one or more section units based on occasion, intent, or recipient context.
4. Displaying a complete governed menu of solo sections and contiguous section combinations.
5. Capturing user selection of a section unit.
6. Distinguishing between selectable, playable, buyable, and fulfilled states.
7. Preventing checkout or fulfillment until exact approved section audio exists.
8. Rendering public product pages from source-backed assets without hard dependency on backend catalog availability.
9. Auditing page, link, audio, and payment throughput as a release gate.

## Definitions

### PIX
A source audio work, track, or source-backed asset used as the initial full-song reference.

### KK / KUT
A defined song-section product candidate, such as a solo section or contiguous combination of song sections. A KUT may become playable, buyable, and fulfilled after approval.

### KK-Kombo
A contiguous combination of multiple song sections.

### MC-BOT
A guided recommendation layer that maps user occasion or intent to recommended song-section choices.

### Twinkle / Page Presentation
The user-facing presentation layer for a KUT, including visible labeling, ordering, helper copy, audio controls, selection controls, and approval status.

## Detailed Description

### Full-song-first flow

The system first presents the user with the full source song. This allows the user to understand the emotional context before choosing a particular section.

### Guided recommendation

After the full source reference is available, MC-BOT recommends one or more KKs. The recommendation may be based on occasion type, relationship, recipient, emotional tone, or other user intent.

### Governed menu

The system displays a governed menu of valid options. In one embodiment, the menu includes:
- recommended KKs first;
- all solo sections;
- all contiguous KK-Kombos;
- no non-contiguous stitching unless separately approved.

### Selection state

Each visible user choice has an active selection link or equivalent interaction. Selection may be stored in URL parameters, session state, database state, or other application state.

### Playable state

A selected KUT becomes playable only when the exact section audio has been materialized and verified.

### Buyable state

A KUT becomes buyable only when the exact audio, page presentation, fulfillment metadata, and checkout path are approved.

### Fulfilled state

A KUT becomes fulfilled when it is delivered to a buyer or recipient through a link, page, SMS, email, downloadable file, or other delivery channel.

### Source-backed public rendering

The public page may render from controlled source-backed rows first. Backend systems such as Supabase or other catalogs may enrich the page but are not required for basic customer page availability.

### Audit gate

A BIC audit checks that:
- public pages return 200;
- visible links resolve;
- visible audio sources return valid audio responses;
- visible choices have selection links;
- checkout handoffs redirect correctly;
- no public page depends on unavailable backend tables.

## Wedding Embodiment

In one embodiment, the Wedding path uses a source track titled Forever & A Day.

The user flow includes:

1. Full song first.
2. MC-BOT Wedding Path.
3. Recommended first KK: V2 + Ch2.
4. Recommended second KK: V2-End.
5. All solo sections:
   - Intro
   - Verse 1
   - Chorus 1
   - Verse 2
   - Chorus 2
   - Bridge
   - Final Chorus
   - Outro
6. All contiguous combos:
   - Intro + Verse 1
   - Verse 1 + Chorus 1
   - Verse 2 + Chorus 2
   - Verse 2 + Chorus 2 + Bridge
   - Bridge + Final Chorus
   - Final Chorus + Outro
   - V2-End
7. Checkout locked until exact approved KUT audio exists.

## Operational Gates

The system maintains separate states:

- Selectable: user can choose it.
- Playable: exact audio exists and plays.
- Buyable: checkout and fulfillment are approved.
- Fulfilled: item has been delivered.

## Claims Support Notes

Potential claim areas include:

1. A method of presenting a source audio work and generating governed song-section product choices.
2. A method of guided occasion-based recommendation of exact song sections.
3. A method of controlling commerce availability based on approval state of exact section audio.
4. A system for source-backed public rendering independent of backend catalog uptime.
5. A method of auditing public page, link, audio, selection, and checkout throughput.
6. A method of presenting recommended section combinations while preserving a complete governed menu.

## Evidence References

See:
- docs/patent/evidence/WEDDING_FLOW_EVIDENCE_MEMO_2026-05-25.md
- docs/patent/evidence/bic-flow-audit-local-2026-05-25.txt
- docs/patent/evidence/bic-flow-audit-production-2026-05-25.txt
- docs/patent/evidence/wedding-page-local-2026-05-25.html
- docs/patent/evidence/wedding-selected-v2-ch2-local-2026-05-25.html
