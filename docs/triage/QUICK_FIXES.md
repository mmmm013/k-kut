# K-KUT Quick Fixes Triage Bucket

## Current Gate

Local BIC audit: PASS with warnings.

Production audit: core paths pass; Thank-you has broken audio candidates.

## QF-001 — Thank-you production audio failures

Production returns 400 for:

- Hang On.mp3
- HOPE YOU KNOW.mp3
- I WANT YOU - 70s - Neil YoungISH.mp3

Production returns 200 for:

- SUNSHINE IN THE MEADOW.mp3

Action:
- Remove broken Thank-you source rows or replace them with reachable approved assets.
- Do not fake Thank-you with unrelated audio.
- Keep only reachable public audio on /personal/thank-you.

Acceptance:
- BIC audit shows zero Thank-you audio failures.

## QF-002 — Audit CTA false positives

Audit warns on action text like Choose this KK, Use this, Checkout.

Action:
- Update audit to ignore valid linked CTAs and approved locked-status text.
- Keep warnings for real dead CTAs.

Acceptance:
- Linked buttons do not warn.
- Real dead CTAs still warn/fail.

## QF-003 — Navigation pages without audio

Home, Hug, Find, and Personal index may intentionally have no audio tags.

Action:
- Mark browse/navigation pages as audioOptional in bic-flow-audit.mjs.
- Keep strict audio checks for product/listen pages.

Acceptance:
- Navigation pages no longer create misleading audio warnings.

## QF-004 — Supabase anon env warning

Build warns NEXT_PUBLIC_SUPABASE_ANON_KEY is missing.

Action:
- Confirm local .env.local.
- Confirm Vercel env.
- Keep public source-backed pages independent from Supabase table uptime.

Acceptance:
- Warning resolved or documented non-blocking.

## QF-005 — Wedding KK audio materialization

Wedding selection flow is working. Full song works. Exact KK audio still needs final approval.

Action:
- Materialize V2 + Ch2 first.
- Then materialize V2-End.
- Apply padding, Twinkle/page presentation, phrase-completion, and listening review.

Acceptance:
- Featured KKs are playable.
- Checkout unlocks only after exact approved KK audio exists.

## Rules

- No visible choice without a working selection link.
- No play claim without reachable audio.
- No buy claim without checkout handoff.
- No public page depends on Supabase table health to render.
