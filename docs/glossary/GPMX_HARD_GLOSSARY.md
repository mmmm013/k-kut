# GPMx Hard Glossary

## Non-Negotiable Definitions

### PIX

PIX is the canonical source master audio object.

PIX lives in the source/SSOT layer, normally Supabase `tracks`.

PIX is source, not product packaging.

### PIX-PCK

PIX-PCK means PIX Package.

PIX-PCK is backend/admin governance packaging around one PIX.

PIX-PCK is not customer-facing.

PIX-PCK may contain source metadata, rights metadata, section maps, backend IIs, KK relationships, KK-Combo relationships, CC records, approval states, and audit lineage.

### KK / K-KUT

KK is a governed K-KUT product object.

A KK is an approved section or complete governed K-KUT derived from a PIX or native original KUT source.

A KK may be customer-facing when approved.

### KK-Combo

KK-Combo is a governed product object made from contiguous approved KKs from the same PIX.

Rules:
- same PIX only
- contiguous only
- original source order only
- no skipped sections inside selected span
- no user rearrangement
- one governed selection per purchase

### CC / Copy-Capture

CC means Copy-Capture.

CC is NOT a product.

CC is NOT sold.

CC is NOT frontend-visible by default.

CC is NOT copywriting.

CC is NOT an invented description.

CC is NOT a caption written by AI.

CC is NOT a KUT, KK, mK, HUG, or TUG.

CC is a backend exact-excerpt capture record from an actual SSOT audio URL.

A valid CC must include or link to:
- exact SSOT audio URL
- source bucket
- source object path
- exact start locator
- exact end locator
- source metadata
- backend II linkage
- audit lineage
- rights/reporting support fields where applicable

CC may support products, auditing, matching, QA, rights, and internal review, but CC itself is not a product.

### mK

mK means mini-KUT.

mK is separate from the PIX/KK/KK-Combo product lane unless explicitly invoked.

mKs are not allowed in KK-Combo construction.

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
