# K-KUT / GPEx / 4PE — Session Legal & Business Log
## Date: 2026-05-26 | Inventor: Gregory Putnam | Entity: G Putnam Music, LLC

---

## 1. CURRENT PLATFORM STATE (as of this session)

- Platform: K-KUT — governed emotional music delivery system
- Live URL: https://www.k-kut.com
- Repo: https://github.com/mmmm013/k-kut
- Stack: Next.js 15.5.15, Supabase, Vercel, Stripe
- Build: PASSING — 86/86 static pages generated
- BIC Audit: PASSING — Failures 0, Warnings 9
- Last commits pushed to main: a41b66d (holiday/[slug] async params + generateMetadata + dynamic audioSrc)

---

## 2. FILING PACKET — docs/patent/filing-packet-2026-05-25

Files committed to repo:
1. KKUT-PROVISIONAL-SPECIFICATION-2026-05-25.md (+ .pdf)
2. KKUT-FIGURE-DESCRIPTIONS-2026-05-25.md (+ .pdf)
3. USPTO-PROVISIONAL-FILING-CHECKLIST-2026-05-25.md
4. README.md

Evidence also committed:
- docs/patent/evidence/bic-flow-audit-local-2026-05-25.txt
- docs/patent/evidence/bic-flow-audit-production-2026-05-25.txt
- docs/patent/evidence/wedding-page-local-2026-05-25.html
- docs/patent/evidence/wedding-selected-v2-ch2-local-2026-05-25.html
- docs/patent/logs/KKUT-INVENTION-LOG-2026-05-25.md

---

## 3. PROVISIONAL PATENT APPLICATION — WORKING TITLE

**Systems and Methods for Guided Song-Section Productization, Selection, Commerce, and Fulfillment**

Inventor: Gregory Putnam
Applicant entity: G Putnam Music, LLC (Sole Proprietor)
Filing target: USPTO Patent Center — Provisional Utility Application
Preferred filing email: gputnam@gputnammusic.com

---

## 4. INVENTION FAMILIES (minimum 5 identified)

### Family 1 — PIX-PCK Backend Governor Package
A backend package for one canonical source master that binds source audio, metadata, rights data, section maps, CCs, IIs, KKs, KK-Combos, approvals, and audit.
Novelty: not just media storage — a governed source-truth package that controls derivative product eligibility.

### Family 2 — CC Exact Source Capture Mechanism
CC (Copy-Capture) as a precision capture mechanism from exact SSOT audio URL, producing/anchoring IIs.
Novelty: exact locator, full source carry, backend lineage, product-state eligibility.

### Family 3 — Contiguous KK-Combo Construction System
A method for constructing product-eligible combo objects only from contiguous approved KKs from the same PIX, preserving source order and preventing user rearrangement.
Novelty: rights-safe governed combos without exposing a remix/edit interface.

### Family 4 — Emotional Music Delivery Object (HUG-TUG System)
A product delivery object that maps emotional intent to a governed audio selection and recipient-facing playable experience.
Novelty: emotion-guided media product delivery with controlled source lineage and one-selection checkout.

### Family 5 — MC-BOT Guided Selection Engine
A voice-active conversational guide that narrows emotional intent, avoids catalog overwhelm, protects rights/product constraints, and guides toward one approved K-KUT or combo.
Novelty: conversational emotional commerce conductor with rights-aware constraints.

### Family 6 — Verse Family / Section Family Governance
VF1 concept: collective verse family with lettered sub-sections, allowing section-level or family-level KKs while preserving composition order.
Novelty: hierarchical music-section governance for product eligibility.

### Family 7 — Rights-Aware Play/Credit Reporting Layer
Backend support for writer/performer/collaborator attribution across variable-duration governed objects.
Novelty: duration-aware, source-linked, derivative-object play/credit evidence.

### Family 8 — Admin-Gated Kreator Intake Pipeline
Free upload access with private intake, Admin classification, rights metadata, and promotion gates.
Novelty: creator-friendly intake without automatic publication or rights exposure.

### Family 9 — GPM HUG Chamber System (Physical-Digital Keepsake)
A modular system for containing, identifying, associating, and delivering emotional audio objects through wearable or portable keepsake chambers (lockets, charms, bracelets, rings, pendants, keepsake capsules). Each chamber is linked to a selected mK, KK, or personalized HUG and provides controlled access through a bound identifier (NFC, QR, serial code) and GPM delivery interface.
Novelty: the integrated chamber system binding a physical object to a curated emotional audio unit, with controlled access, personalization, and multi-format modularity.

---

## 5. HARD GLOSSARY (locked doctrine)

- **PIX** — Canonical source master. Source-of-truth audio object, generally in Supabase tracks.
- **PIX-PCK** — PIX Package. Backend/admin governance packaging around one PIX. Not customer-facing.
- **CC** — Copy-Capture. Mechanism (NOT product). Grabs exact excerpts from actual PIX MP3/WAV SSOT URL. Produces/anchors IIs.
- **II** — Inventory Item. Backend identity produced, anchored, or governed through CC.
- **KK** — Governed K-KUT product object.
- **KK-Combo** — Governed product object made from contiguous approved KKs from the same PIX. Same PIX only. Contiguous only. Original source order only. No skipped sections. No user rearrangement.
- **BOT / MC-BOT** — Guide-layer assets. Not PIX, not KKs, not CCs unless deliberate exact-source capture record is created.
- **HUG** — Emotional product delivery object (buyer-facing).
- **4PE** — GPEx governed intake/processing engine.
- **KKr** — Hidden connector between approved intake item and refinement engine.
- **mK** — mini-KUT. Must NOT contaminate KK-Combo lane.
- **GPMx** — G Putnam Music operating entity / source of ASCAP-registered tracks.
- **GPEx** — Expansion governance layer.

---

## 6. BIC AUDIT RESULTS — 2026-05-26

### Wedding KK Menu — ALL PASS
- recommended-v2-plus-ch2-best-kk-kombo: PASS
- recommended-next-v2-end: PASS
- solo-intro through solo-outro: PASS (10 items)
- kombo-intro-plus-verse-1 through kombo-v2-end: PASS (7 items)
- Wedding menu order (recommended, solos, kombos): PASS
- Wedding KK selection state: PASS

### Checkout / Payment Handoffs — ALL PASS
- birthday checkout 307 → Stripe: PASS
- anniversary checkout 307 → Stripe: PASS
- generic personal checkout 307 → Stripe: PASS
- wedding direct checkout guard 307 → Stripe: PASS

### Summary: Failures 0 | Warnings 9

---

## 7. USPTO CALL SCRIPT (prepared 2026-06-18 target)

"I am trying to file a provisional patent application today. I can log into USPTO.gov, but Patent Center keeps sending me back to the new-user/enrollment flow instead of showing New Submission. Please check my Patent Center access and tell me exactly what step is missing — ID verification, self-enrollment, account linking, or something else. My preferred filing email is gputnam@gputnammusic.com."

---

## 8. GPEx / 4PE STRATEGY DOCTRINE (locked)

### Core Principle
The public user sees a simple emotional product. The internal system sees a governed business process.

### 4PE KKr-BIZ-MSC Intake Map
- K-KUT is the first visible buyer-facing proof of a deeper GPEx operating strategy
- GPEx 4PE Intake → KKr (hidden connector) → BIZ classification → MSC music-process classification → KKr-BIZ-MSC refinement loops → GPMx song assets → ASCAP registered tracks → approved K-KUT HUG retail output → customer excitement → viral readiness

### Locked Doctrine
- Occasion helps users enter.
- Feeling helps users choose.
- Music helps users send.
- 4PE makes the process visible.
- KKr routes and refines the music-business object.
- BIZ identifies the business context.
- MSC identifies the music context.
- K-KUT proves the system in public.
- HUG delivers the emotional product.
- GPEx governs the expansion.

### Public vs Internal Language
- Public: HUG, K-KUT, song moment, audio greeting card, feeling, choose, send, private link
- Internal: 4PE Intake, KKr, BIZ, MSC, KKr-BIZ-MSC, refinement loops, approval gates, fulfillment metadata, compliance rail, viral path

---

## 9. PLATFORM OPERATING LOOP

1. Canonical source audio enters Supabase tracks.
2. PIX-PCK is created for the source.
3. CC captures exact excerpts from the PIX SSOT URL.
4. IIs are produced/anchored.
5. Admin classifies captured IIs into governed kut types.
6. Approved KKs and KK-Combos become product-eligible.
7. Frontend shows only approved scripted user flow.
8. User buys one governed KK or KK-Combo.
9. Backend preserves source, rights, lineage, duration, play, and credit evidence.

---

## 10. RISK REGISTER

- Risk 1: Term drift — CC keeps being misdescribed as product/copy. Control: start every session with glossary.
- Risk 2: mK leakage into KK-Combo lane. Control: hard-exclude mK/mini-KUT/mk-products in combo scripts.
- Risk 3: User rearrangement — site looks like a remix/build-your-own-song tool. Control: one governed KK or KK-Combo per purchase, pre-approved combos only.
- Risk 4: Backend concepts leaking frontend. Control: frontend obeys approved script only.
- Risk 5: Patent overclaiming. Control: claim invention families separately; use Sandman and apology flows as evidence.
- Risk 6: ASCAP language too strong. Control: use 'designed to support ASCAP-aligned reporting' — not 'fully compliant'.

---

## 11. PATENT FILING STATUS — 2026-05-26

- [ ] Log into USPTO Patent Center (https://patentcenter.uspto.gov)
- [ ] Start new submission — Provisional Utility Application
- [ ] Enter applicant/inventor: Gregory Putnam, G Putnam Music, LLC
- [ ] Upload specification PDF: KKUT-PROVISIONAL-SPECIFICATION-2026-05-25.pdf
- [ ] Upload figures PDF: KKUT-FIGURE-DESCRIPTIONS-2026-05-25.pdf
- [ ] Review entity status (micro entity likely applies)
- [ ] Pay filing fee
- [ ] Save filing receipt immediately
- [ ] Record application number and filing date here
- [ ] Calendar nonprovisional deadline: 12 months from filing date
- [ ] Mark all materials: PATENT PENDING after successful filing

---

## 12. SESSION NOTES — 2026-05-26 2PM CDT

- Completed: app/holiday/[slug]/page.tsx — all 3 fixes committed to main (a41b66d)
  - Next.js 15 async params fix
  - generateMetadata() for SEO (per-holiday title, description, OpenGraph, Twitter)
  - Dynamic audioSrc per holiday with fallback
- Attached documents saved this session:
  - paste.txt — BIC audit, wedding flow, build logs, patent filing session
  - GPMx-K-KUT-4PE-Current-State-Platform-Report.docx
  - USPTO-Call-Script-06.docx
  - GPEx-4PE-Strategy-Doctrine.docx
  - GPEx-Invention-Statement.pdf (HUG Chamber System)
- Next immediate action: FILE PROVISIONAL PATENT APPLICATION via USPTO Patent Center

---

*This document is a working session log for patent and business reference. Do not publish externally.*
