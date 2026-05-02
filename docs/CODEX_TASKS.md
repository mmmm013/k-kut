# Codex Task Queue — K-KUT / GPEx

## Task 1 — Release Safety Harness
Audit the repo for build/deploy safety.

Requirements:
- Find all `createClient` usage.
- Confirm no API route creates Supabase at module load.
- Confirm `npm run build` passes.
- Confirm homepage contains:
  - `Order Mother’s Day HUG`
  - `A GPM HUG is a new kind`
  - `Thank You — Source Preview`
- Confirm `public/mothers-day/thank-you-source.mp3` exists.
- Confirm no public promo copy displays raw artist names.
- Add/maintain `scripts/release-check.mjs`.

Expected output:
- One PR/commit.
- Build log.
- Release-check output.

## Task 2 — Holiday Promo Config System
Turn holiday promos into config-driven pages.

Use:
- `promos/mothers-day.json`

Requirements:
- Promo copy, allowed units, blocked defaults, sample list, purchase rules, and CTA labels come from config.
- Homepage and `/find` render from config.
- No code surgery required for Father’s Day / Valentine’s Day.
- Holiday samples must come only from the respective holiday source song(s).

Expected output:
- Config schema.
- Updated Mother’s Day config.
- Build passes.

## Task 3 — HUG Fulfillment Flow
Create full no-download gift flow.

Buyer:
- hears sample
- buys HUG
- provides recipient name
- recipient email
- send date
- sender name
- message

System:
- Stripe checkout/payment creates HUG record
- HUG record has private slug/id
- recipient opens `/hug/<id>`
- page plays audio
- no download required

Rules:
- One K-KUT per purchase per day.
- Multiple HUGs require separate purchases.
- Each HUG honors one source title/song and one recipient moment.

Expected output:
- Stripe field mapping
- DB/table assumptions
- webhook handling
- `/hug/[id]` receiver page verified
- build passes

## Task 4 — Thank You Scripted Samples
Create real Mother’s Day listening room from `Thank You`.

Required units:
- Thank You — mVerse
- Thank You — Contiguous Chorus
- Thank You — Verse 1
- Thank You — Verse 2
- Thank You — Chorus 3
- Thank You — Outro
- Thank You — Bite-size HUG

Rules:
- Use only `Thank You`.
- No random mKs.
- No unrelated clips.
- No artist names in display titles.
- Each card must have audio player and buy CTA.

Expected output:
- public sample files or storage URLs
- sample metadata config
- homepage/listening room renders samples
- build passes
