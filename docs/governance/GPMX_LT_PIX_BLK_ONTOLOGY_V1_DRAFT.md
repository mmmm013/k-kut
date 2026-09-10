# GPMx LT-PIX / BLK / KUT Ontology V1

Status: LOCKED — OWNER AUTHORIZED  
Authority update: 2026-09-10  
Mass-generation effect: AUTHORIZED ONLY THROUGH THIS ORDER

This locked ontology is the governing KUT-production authority. Historical case files and product examples do not override it.

## Stable source inventory

- The current KUT source inventory is exactly **324 FullMix LT-PIX SSOTs**.
- Each LT-PIX is the original authorized FullMix file.
- Every KK, KK-KOMBO, mK, and sK is an exact excerpt copied directly from that FullMix SSOT.
- Every derivative preserves the exact source Track ID, source object/path, source SHA256, CC boundaries, and rendered-audio SHA256.
- INSTRO-ONLY / INO-PIX inventory is separate inventory and is never a KUT source.
- KKr may perform its own separation while processing the FullMix; that operation never substitutes an INSTRO-ONLY inventory row for the FullMix SSOT.
- Source identity, ownership, copyright, publishing, and ASCAP identifiers are stable authority. Descriptive, interpretive, theme, sentiment, and merchandising metadata may be revised without changing source or audio identity.

## Structural objects

| Object | Meaning | What it cannot mean |
|---|---|---|
| FullMix LT-PIX | The complete authorized original FullMix source, with exact identity, audio authority, rights lineage, and complete lyric/transcript source. | An INSTRO-ONLY row, filename guess, derivative excerpt, or candidate batch. |
| BLK | One actual song section established by the composition, lyric/vocal function, and audible boundaries. | An equal-time slice, target duration, CC, heading, or convenient inventory row. |
| KK | One approved exact FullMix CC of one proven BLK. | A raw candidate, generic excerpt, unchecked source window, or heading-created cut. |
| KK-KOMBO | One approved exact FullMix CC spanning two or more source-contiguous proven BLKs in original song order. | Noncontiguous assembly, cross-source assembly, or substitute for missing BLK proof. |
| mK | An exact FullMix excerpt derived only within proven BLK authority after the KK/KOMBO inventory is established. | A duration-generated slice or independent source. |
| sK | An exact FullMix excerpt derived only within proven BLK authority after the mK inventory is established. | A duration-generated slice or independent source. |
| CC | The exact Copy-Capture operation and record that copies approved boundaries from the FullMix SSOT. | Structural proof, a boundary generator, or a user-selected raw source. |
| Heading | Post-capture descriptive structure metadata for KK/KOMBO only. | Permission to move a boundary, create a BLK, or alter captured audio. |

## Mandatory production order

For each of the 324 FullMix LT-PIX SSOTs:

1. Prove the exact FullMix identity, source location, source SHA256, rights lineage, and complete lyrics/transcript.
2. Listen to the complete source and establish the sequential BLK map from actual musical, lyric, vocal, and transition evidence.
3. Lock each BLK boundary. No fixed duration, quota, or heading may establish a boundary.
4. Create each KK by CCing the exact FullMix excerpt for one proven BLK.
5. Create each KK-KOMBO by CCing one exact, source-contiguous FullMix range spanning two or more proven adjacent BLKs.
6. Verify the captured audio against the original FullMix, including complete vocal onset, last vocal note, musical resolution, and no neighboring-BLK trespass.
7. Only after the CC passes verification, assign permitted KK/KOMBO headings.
8. Complete owner review and approval.
9. After the KK/KOMBO inventory is established, derive mKs from proven BLK authority.
10. After the mK inventory is established, derive sKs from proven BLK authority.

No step may be reordered or skipped.

## Heading law

- BLKs are the structural authority. Headings are applied only after KK/KOMBO capture and verification.
- Traditional headings are display metadata for KKs and KK-KOMBOs only.
- Permitted traditional display headings are sequential verse and chorus labels such as `V1`, `V2`, `Ch1`, and `Ch2`, plus `Bridge`.
- An existing internal `Br` key may remain for identity compatibility; its permitted traditional display heading is `Bridge`.
- A heading must be supported by listening evidence. If not proven, the item remains `BLK[n]`.
- mKs and sKs retain exact BLK lineage and do not receive traditional song-structure headings.

### KLEIGH rule

- KLEIGH works never expose guessed traditional song structure.
- When a recurring chorus/title passage is actually heard and proven, its KK/KOMBO display heading is `Refrain` or sequential `Refrain[n]` where occurrence distinction is required.
- Every other KLEIGH section remains `BLK[n]`.
- Verse, chorus, and bridge headings are forbidden for KLEIGH inventory unless the owner explicitly changes this locked rule.

## BLK and boundary law

1. A BLK is a song section. Section counts are descriptive only and never quotas.
2. The BLK map comes from complete lyric coverage and repeated listening for composition, lyric/vocal function, and exact audible transitions.
3. Start TP and End TP record a proven boundary; they do not create it.
4. The CC copies the locked BLK or contiguous-BLK range exactly from the original FullMix.
5. No cut may interrupt a vocal, truncate the last vocal note, begin in the wrong adjoining section, or trespass into the next BLK.
6. Repeated sections remain sequentially distinct when their occurrence, delivery, boundary, or meaning differs.
7. Unresolved evidence remains `TRIAGE`; it is never replaced with an invented timestamp or guessed heading.

## Duration law

- Time may be recorded only as locator and verification metadata.
- Duration never triggers a CC.
- Duration never qualifies or disqualifies a KK, KK-KOMBO, mK, or sK.
- No minimum, maximum, preferred, fixed, repeated, or tier-specific duration may generate or approve a KUT.
- The only duration-based product rule is outside these KUT tiers: every SWSP instrumental KUT must run at least 13 seconds.
- Legacy fixed-duration windows remain `HOLD_NOT_BLK` and may never be relabeled in place.

## Controlled states

| State | Exact use |
|---|---|
| `TRIAGE` | Required source, BLK, CC, heading, audio, or review evidence is incomplete. Preserve uncertainty; do not guess. |
| `STAGE` | Every required proof passes and owner review authorizes controlled eligibility. |
| `HOLD` | A known conflict, unsafe use, disqualified object, missing indispensable authority, or owner stop prevents movement. |
| `HOLD_NOT_BLK` | A legacy fixed-window object is prohibited from being treated as a BLK. |

## Approval and revision law

- Candidate is not approved.
- Inventory is not public.
- Owner review is the final approval gate.
- Approved source identity and audio evidence never change silently.
- A correction creates an append-only governed revision; the prior record remains preserved until replacement approval and archival.
- Descriptive metadata may improve without re-cutting or re-identifying the immutable product.
