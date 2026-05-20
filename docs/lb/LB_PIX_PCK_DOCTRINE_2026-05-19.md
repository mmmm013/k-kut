# LB Doctrine — PIX-PCK

## Definition

PIX-PCK means PIX Package.

A PIX-PCK is a backend/admin governance package for one canonical PIX source master.

A PIX-PCK is not a customer-facing product.

## Core Asset Separation

- PIX = canonical source master
- PIX-PCK = backend package governing that PIX and its related materials
- KK = approved K-KUT / section object
- KK-Combo = approved contiguous sequence of KKs from the same PIX
- CC = exact copy-capture excerpt from exact PIX SSOT URL
- II = backend Inventory Item / internal identity layer
- BOT dialog = separate guided interaction layer

These lanes must not be collapsed.

## PIX-PCK Purpose

PIX-PCK exists to keep all backend governance for a PIX together without exposing internal machinery to users.

A PIX-PCK may contain:

- canonical source audio URL
- Supabase bucket and object path
- exact source file identity / hash where available
- full audio metadata
- title and alternate title forms
- writer / performer / collaborator metadata
- rights / ASCAP / publishing notes
- lyrics / transcript if available
- section map
- verse-family map, such as V1 / VF1 with V1a, V1b, V1c
- KK candidates
- approved KKs
- KK-Combo candidates
- approved KK-Combos
- CC candidates
- approved CCs
- IIs
- approval states
- audit trail
- admin notes
- reporting / crediting support fields

## Frontend Rule

PIX-PCK is backend/admin only.

The frontend must not expose:

- PIX-PCK machinery
- raw IIs
- rights metadata
- backend audit records
- unapproved section maps
- unapproved CCs
- unapproved KK candidates
- source package internals

The frontend obeys approved script and product state only.

## Product Rule

Users may receive or purchase only governed products:

- one KK
- or one pre-approved KK-Combo

Users cannot:

- access a PIX-PCK
- rearrange sections
- build custom edits
- combine non-contiguous KKs
- reorder source composition
- expose backend lineage or rights machinery

## CC Rule Inside PIX-PCK

A CC inside a PIX-PCK must remain tied to:

- exact source URL
- exact source object path
- exact start locator
- exact end locator
- full source audio
- backend metadata
- IIs
- audit lineage
- approval status

A CC is not invented copy.  
A CC is exact excerpt / copy-capture from the PIX SSOT.

## KK-Combo Rule Inside PIX-PCK

A KK-Combo inside a PIX-PCK is valid only when:

- every section belongs to the same PIX
- sections are contiguous
- original source order is preserved
- no section is skipped inside the selected span
- combo is pre-approved by Admin/GPMx
- combo is delivered as one governed product

## Sandman's Comin' Example

PIX:

- Sandman's Comin'

PIX-PCK:

- canonical source audio
- Sandman lyrics
- Sandman section map
- V1 / VF1 structure
- V1a and V1b as sub-sections
- approved KK candidates
- first selected KK-Combos:
  1. Intro → Whoa Whoa → V1a → Break / Bridge
  2. V1a → Break / Bridge → Whoa Whoa → V1b → Echo → Ch1
  3. V2 → Echo → Ch2 → Whoa Whoa → Ch3 → Outro
- future CC exact excerpts
- backend IIs
- rights and audit metadata

## Governance Rule

PIX-PCK is the backend governor container.

It answers:

- What is the true source?
- Which KKs belong to this PIX?
- Which CCs came from this exact source URL?
- Which combos are contiguous and approved?
- Which objects are backend-only?
- Which objects are product-visible?
- Which rights/crediting records attach?
- Which IIs and audit entries support the product?

## Acceptance Tests

- A PIX-PCK cannot exist without a PIX.
- A PIX-PCK cannot be customer-facing.
- A KK inside a PIX-PCK must map back to the PIX.
- A KK-Combo inside a PIX-PCK must be contiguous and source-ordered.
- A CC inside a PIX-PCK must map to exact SSOT URL and exact locator.
- Frontend must not expose raw IIs or PIX-PCK internals.
- Users cannot rearrange or remix sections from a PIX-PCK.
