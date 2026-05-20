# GPMx Hard Glossary

## Non-Negotiable Definitions

### PIX

PIX is the canonical source master audio object.

PIX lives in the source / SSOT layer, normally Supabase `tracks`.

PIX is the full source master, not the customer-facing product.

### PIX-PCK

PIX-PCK means PIX Package.

PIX-PCK is backend/admin governance packaging around one PIX.

PIX-PCK is not customer-facing.

PIX-PCK may contain source metadata, rights metadata, section maps, backend IIs, KK relationships, KK-Combo relationships, CC records, approval states, and audit lineage.

### CC / Copy-Capture

CC means Copy-Capture.

CC is NOT a product.

CC is NOT sold.

CC is NOT frontend-visible by default.

CC is NOT copywriting.

CC is NOT invented description text.

CC is NOT a caption written by AI.

CC is NOT itself a KUT, KK, mK, HUG, or TUG.

CC is the precision capture mechanism.

CC grabs exact excerpts from the exact PIX SSOT audio URL.

CC is like a photographing tool: it captures, carries, and anchors exact source truth.

A CC must carry or link to:

- exact PIX SSOT audio URL
- source bucket
- source object path
- exact start locator
- exact end locator
- full source audio linkage
- source metadata
- backend II linkage
- audit lineage
- rights/reporting support fields where applicable

CC may include deliberate same-source pre/post padding as part of the exact capture locator.

Padding cannot introduce external audio.
Padding cannot invent text.
Padding cannot detach from SSOT.
Padding cannot break source lineage.

### II / Inventory Item

II means Inventory Item.

IIs are produced, anchored, or governed through CC.

An II is the backend identity for a captured object or governed excerpt.

Every II must remain tied to its CC basis and PIX SSOT lineage.

### kut / kut types

“kut” in the broad/internal sense refers to governed captured excerpt forms.

Possible kut types include:

- SWSP
- K-KUT / KK
- K-UPID
- mini-KUT / mK
- LineFeel
- other governed excerpt forms

CC is the mechanism that captures and carries source truth for these IIs.

### KK / K-KUT

KK is a governed K-KUT product object.

A KK is an approved K-KUT / section / excerpt object derived from a PIX through governed capture and review.

A KK may be customer-facing when approved.

A KK must remain tied to its PIX, CC basis, II identity, source metadata, and approval state.

### KK-Combo

KK-Combo is a governed product object made from contiguous approved KKs from the same PIX.

Rules:

- same PIX only
- contiguous only
- original source order only
- no skipped sections inside selected span
- no user rearrangement
- one governed selection per purchase

### mK / mini-KUT

mK means mini-KUT.

mK is a governed kut type, but it is separate from the KK / KK-Combo lane unless explicitly invoked.

mKs are not allowed inside KK-Combo construction unless a separate doctrine explicitly permits a different lane.

### LineFeel

LineFeel is a governed captured feel/line object.

A LineFeel is not automatically a KK.

A LineFeel must still be tied to source lineage through CC/II if it is source-derived.

### BOT Dialog / MC-BOT Assets

BOT dialog and MC-BOT voice assets are guide-layer assets.

They are not PIX.

They are not KKs.

They are not CCs unless a specific backend exact-source capture record is intentionally created from an approved SSOT audio URL.

## Frontend Rule

Frontend obeys approved script only.

Frontend must not expose:

- PIX-PCK internals
- raw IIs
- backend CC machinery
- rights/audit metadata
- unapproved section maps
- unapproved KK candidates
- unapproved CC records

## Product Rule

Customers may receive or purchase:

- one KK
- or one approved KK-Combo
- or a governed delivery experience such as HUG/TUG

Customers may not:

- rearrange song sections
- build custom edits
- stitch non-contiguous KKs
- access PIX-PCK internals
- access CC backend records by default
