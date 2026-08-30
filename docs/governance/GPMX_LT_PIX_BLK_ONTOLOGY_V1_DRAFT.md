# GPMx LT-PIX / BLK / KK Ontology V1 — Draft

Status: DRAFT — PENDING OWNER LOCK  
Mass-generation effect: FROZEN

This draft does not replace any locked product law. It defines the distinctions that must be reconciled and owner-locked before mass BLK/KK text generation may resume.

## Structural objects

| Object | Meaning | What it cannot mean |
|---|---|---|
| LT-PIX | The complete authorized source song/work, with exact identity, audio authority, rights lineage, and complete lyric/transcript source. | A filename guess, derived excerpt, or candidate batch. |
| BLK | One actual song section established by the song's composition, lyric/vocal function, and audible boundaries. | An equal-time slice, a target duration, a CC, or a convenient inventory row. |
| sBLK | A deliberately identified structural subdivision of a proven BLK, such as Verse 1a or Verse 1b. | A microcut created merely because it is short. |
| KK | A separately approved customer product bound to a proven structural item and its exact audio/delivery evidence. | A raw candidate, CC, generic excerpt, or unchecked source window. |
| KK-Kombo | Two or more approved, source-contiguous KKs in original song order. | Noncontiguous assembly or a substitute for missing BLK proof. |
| CC | An internal Copy-Capture record with exact source text/audio locators and lineage. A CC may cite evidence inside a BLK. | A BLK definition, a structural boundary, or a customer product by itself. |
| NBLK | A separately interpreted public form derived only after an independently proven BLK meaning supports it. | A shortcut around BLK proof or an inherited whole-song meaning. |

## BLK law

1. A BLK is a **song section**. Average section counts such as five to seven are descriptive only; they are never quotas.
2. The section map comes from complete lyric coverage plus repeated human listening for composition, lyric/vocal function, and exact audible transitions.
3. Start TP and End TP record a proven structural boundary. They do not create that boundary.
4. A label is assigned only when the evidence supports it. An unresolved label stays null in a `TRIAGE` worksheet; it is not guessed as verse, chorus, bridge, or another convenient name.
5. Repeated sections remain sequentially distinct (`Ch1`, `Ch2`, final chorus, and so on) when their occurrence, delivery, boundary, or meaning differs.
6. Silence, pickup, overlap, instrumental transition, vocal onset, and vocal completion must be heard and recorded. A cut may not interrupt a vocal or begin in the wrong adjoining section.

## Legacy 23–24-second windows

The old windows were candidate clock ranges made at roughly fixed lengths. They may be useful only as historical locators. Their duration was chosen before the song's actual structure was proven, so none is a BLK.

Their correct status is `HOLD_NOT_BLK`: a hard bar against accidental structural use. If a legacy boundary later happens to coincide with a fully proven section, the reviewer creates a new BLK record with full authority and listening evidence. The old window is never silently relabeled.

## Controlled uncertainty

| State | Exact use |
|---|---|
| `TRIAGE` | Evidence exists, but one or more required joins or proofs remain incomplete. Keep proposed boundaries/labels visibly unresolved and do not guess. |
| `STAGE` | Every required proof passes. This is the controlled eligible state, not a maybe-state. |
| `HOLD` | A known conflict, unsafe use, disqualified object, missing indispensable authority source, or explicit stop prevents further movement. |
| `HOLD_NOT_BLK` | A legacy fixed-window object is expressly prohibited from being treated as a BLK. |

Therefore, ordinary structural uncertainty produces `TRIAGE`, never `STAGE`. `HOLD` is used only when the uncertainty exposes a specific stop condition; the legacy windows already meet that stop condition because they are known arbitrary slices.

## Short-duration control requiring reconciliation

The proposed operational control is:

- a normal KK with less than 10.000 seconds of source musical content cannot pass the review gate;
- delivery padding, silence, and Twinkle/bookends do not count toward the source-content duration;
- only an exact, owner-locked registry entry may authorize a one-off exception;
- `Best Birthday` and `Sorry / I'm Sorry` are the two named exception families pending exact LT-PIX and source-authority binding;
- a duration above 10 seconds never proves BLK identity, and duration may never be used to manufacture a section.

This control must be reconciled before lock with the existing locked text-structure statement that duration is not a KK qualification rule. The intended reconciliation is that musical structure establishes the BLK/KK, while the sub-10-second rule is a release anomaly/exception gate. Until the owner locks that reconciliation and exact exception identities, the mass-generation freeze remains active.

## Required evidence order

1. Resolve exact LT-PIX identity, SSOT audio, hash, rights, and complete canonical lyrics/transcript.
2. Perform and record human composition listening.
3. Perform and record lyric/vocal-function listening.
4. Map every sequential BLK with exact TP boundaries and evidence, without a target count or target duration.
5. Interpret each BLK independently; do not inherit whole-song meaning.
6. Bind eligible KK candidates only to proven structural items.
7. Apply the exception registry and review gate.
8. Obtain explicit human structural-listening approval before `STAGE`.

## Unlock condition

Mass BLK/KK text generation remains frozen until this ontology, the per-LT-PIX worksheet, the exception registry, and the review gate each carry an owner-approved `LOCKED` status and the freeze is separately lifted.
