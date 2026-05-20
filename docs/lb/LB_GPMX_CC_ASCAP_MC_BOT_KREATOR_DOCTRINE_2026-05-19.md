# LB Doctrine — GPMx CC / ASCAP / MC-BOT / Kreator Upload

## Critical Correction

CC means Copy-Capture.

A CC is an exact excerpt from an exact MP3/WAV/audio SSOT URL, normally from Supabase storage `tracks`.

A CC is not invented copy.
A CC is not interpretive helper text.
A CC is not BOT dialog.
A CC is not a caption written by the assistant.
A CC is not frontend-visible backend metadata.

## Core Asset Separation

GPMx preserves separate lanes:

1. PIX — canonical full source master.
2. KK — approved K-KUT / section object.
3. KK-Combo — approved contiguous sequence of KKs from the same PIX.
4. CC — backend exact excerpt / copy-capture record from an exact source audio SSOT URL. CC is not a product.
5. BOT Voice / MC-BOT — guided conversational product flow.

These lanes must not be collapsed.

## CC / Copy-Capture Doctrine

CC = exact-excerpt-from-exact-MP3-SSOT-URL.

The SSOT is the backend canonical audio source, normally:

- Supabase bucket: `tracks`
- exact object path
- exact public/internal source URL
- exact file identity/hash where available

Each CC must remain tied on the backend to:

- full source audio
- source bucket
- source object path
- exact source URL
- exact start time
- exact end time
- source metadata
- internal identifiers / IIs
- rights metadata
- attribution metadata
- audit lineage
- approval state

Full audio, metadata, IIs, source lineage, and rights/audit information remain backend-only unless deliberately exposed by approved frontend script.

## Frontend Rule

The frontend obeys by script.

The frontend must not become an editor, remix tool, rights dashboard, or metadata exposer.

Frontend may show only approved user-facing output, such as:

- approved HUG / K-KUT page language
- approved playable selection
- approved recipient-facing copy
- approved MC-BOT prompt
- approved purchase/display state

Backend retains the complete SSOT, CC, II, metadata, rights, lineage, and audit machinery.

## Padding Rule

Padding may be used only as part of exact excerpt capture.

Padding means the CC locator may include deliberate pre/post audio context from the same SSOT source file.

Padding cannot introduce external audio.
Padding cannot invent text.
Padding cannot break source lineage.
Padding cannot detach the CC from the exact MP3 SSOT URL.

Any external sound requires absolute requirement plus Admin approval.

## Twinkle Doctrine

A prior pre-KUT / post-KUT sound generally referred to as “Twinkle” worked well and must be preserved as doctrine.

Twinkle rule:

- internal sounds only by default
- no external sound unless absolutely required
- Admin approval required for any external source
- preserve SSOT linkage and backend audit

## KK / KK-Combo Purchase Rule

A user may purchase only one governed KK or KK-Combo per transaction.

The site must not allow users to:

- rearrange song sections
- build custom song edits
- select multiple non-contiguous KKs and stitch them together
- reorder the source composition

A KK-Combo is allowed only when:

- sections are contiguous
- source order is preserved
- no section is skipped inside the selected span
- the combo is pre-approved
- delivery is controlled as one governed product

## ASCAP / Rights Doctrine

GPMx is designed to support ASCAP-aligned operation through:

- source lineage
- controlled delivery
- exact source URL anchoring
- backend-only rights metadata
- one governed K-KUT / KK-Combo per purchase
- no user rearrangement of song sections
- no remix-building interface
- play tracking
- duration-aware metadata
- crediting performers, co-writers, collaborators, and rights participants
- preserving reporting evidence across varying durations

Preferred LB language:

“GPMx is designed to support ASCAP-aligned reporting, crediting, source lineage, and controlled delivery. Final compliance characterization requires legal/account review against current ASCAP agreements, publisher terms, and distribution/streaming obligations.”

## MC-BOT Doctrine

MC-BOT is a separate guide layer.

MC-BOT duties:

- guide the user one step at a time
- preserve emotional clarity
- avoid overwhelming the user
- never show the whole catalog at once
- recommend one curated set at a time
- use approved real MC voice assets where available
- support HUG/TUG/KK product selection
- protect product boundaries and rights logic

BOT voice assets are not PIX.
BOT voice assets are not KKs.
BOT voice assets are not CCs unless an approved CC is intentionally spoken or referenced under script.

## GPM Kreators Free Upload Access

Priority 3.

Requirement:
GPM Kreators must have free upload access for source review.

Free upload does not mean:

- free publication
- automatic PIX creation
- automatic KK creation
- automatic backend CC record creation

Flow:

1. Kreator uploads source material.
2. Upload enters private intake/review queue.
3. Admin reviews rights, quality, metadata, and intended use.
4. Admin assigns lane:
   - reject
   - needs info
   - private raw
   - PIX candidate
   - MC/BOT asset candidate
   - backend CC record candidate
5. Only Admin-approved assets can become PIX, KK, KK-Combo, or public product. CC records may be created only as backend exact-source capture records tied to SSOT URL and locator.

## Acceptance Tests

- A CC cannot exist without exact SSOT source URL.
- A CC cannot exist without exact start/end locator.
- A CC cannot detach from full audio and metadata on backend.
- Frontend cannot expose backend IIs by default.
- Users cannot rearrange sections.
- Users can purchase one governed KK or KK-Combo only.
- Kreator upload is private by default.
- No uploaded file becomes public without Admin approval.


## Hard Clarification

CC / Copy-Capture is not a product.

CC is backend infrastructure: an exact excerpt capture record from an exact SSOT audio URL with exact locator and lineage.

CC may support KK, KK-Combo, HUG/TUG, QA, rights, matching, and audit workflows, but CC itself is never the customer product.
