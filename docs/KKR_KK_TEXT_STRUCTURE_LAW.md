# KKr KK Text-Structure Law

Status: LOCKED — OWNER AUTHORIZED  
Authority update: 2026-09-10

## Core order

KKr must process every KUT in this exact order:

1. Establish and lock the BLK map from the original FullMix LT-PIX SSOT.
2. CC the exact KK from one proven BLK, or CC the exact KK-KOMBO from two or more contiguous proven BLKs.
3. Verify the CC against the FullMix, including the last vocal note and adjoining BLK boundaries.
4. Add the permitted KK/KOMBO heading.
5. Obtain owner approval.

A heading never creates a cut. A CC never establishes a BLK.

## KK and KK-KOMBO validity

A KK is valid only when it is an exact FullMix CC of one proven BLK.

A KK-KOMBO is valid only when it is one exact FullMix CC spanning two or more source-contiguous proven BLKs in their original order.

Both must preserve:

- FullMix LT-PIX Track ID
- FullMix source object/path
- FullMix source SHA256
- component BLK identities
- exact CC start and end locators
- captured/rendered audio SHA256
- approval and revision history

INSTRO-ONLY / INO-PIX is never a KUT source.

## What never qualifies or creates a KUT

- duration
- file size
- arbitrary time thresholds
- equal-time windows
- target counts
- headings
- filenames
- folder discovery
- INSTRO-ONLY inventory
- raw CCs without BLK authority
- noncontiguous KOMBO assembly

Time may be stored as locator and verification metadata. Duration never triggers a CC and never qualifies or disqualifies a KK, KK-KOMBO, mK, or sK.

Only SWSP instrumental KUTs have a duration rule: they must run at least 13 seconds.

## Heading law

Traditional song-structure headings are added only to verified KKs and KK-KOMBOs after capture.

Permitted traditional display headings include:

- `V1`, `V2`, and later sequential verses
- `Ch1`, `Ch2`, and later sequential choruses
- `Bridge`

An internal legacy `Br` identity may remain stable; its permitted display heading is `Bridge`.

If a traditional heading is not proven, the item remains `BLK[n]`.

### KLEIGH

KLEIGH structure is never guessed or exposed as traditional verse/chorus/bridge structure.

- A proven recurring chorus/title passage may be headed `Refrain` or `Refrain[n]`.
- Every other KLEIGH item remains `BLK[n]`.
- No other traditional structure heading is assigned without a new explicit owner rule.

mKs and sKs retain BLK lineage and do not receive traditional song-structure headings.

## Production sequence

The catalog is processed in this order:

1. 324 FullMix LT-PIX SSOTs
2. KKs and KK-KOMBOs
3. owner approval
4. mKs
5. sKs

## Existing Thank You identities

Existing internal structure identities remain:

`V1a`, `V1b`, `PreCh1`, `Ch1`, `V2a`, `V2b`, `Br`, `Ch2`, `Outro`.

This preserves stable identity. Where traditional customer-facing heading metadata is used, internal `Br` may display as `Bridge`; the underlying identity is not renamed.
