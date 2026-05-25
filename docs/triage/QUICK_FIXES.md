# K-KUT Quick Fixes Triage Bucket

Purpose: capture non-blocking BIC audit warnings and small defects without derailing the main release path.

## Current gate status

Local BIC audit: PASS with warnings.

- Build: PASS
- Local page/link/audio/payment throughput: PASS
- Wedding KK selection links: PASS
- Wedding full-song audio: PASS
- Birthday audio: PASS
- Anniversary audio: PASS
- Apology audio: PASS
- Payment handoffs: PASS

Production audit: mostly PASS, with Thank-you audio failures to triage.

## Quick-fix queue

### QF-001: Thank-you production audio candidates

Status: OPEN.

Production audit reports three Thank-you audio objects returning 400:

- Hang On.mp3
- HOPE YOU KNOW.mp3
- I WANT YOU - 70s - Neil YoungISH.mp3

`SUNSHINE IN THE MEADOW.mp3` returns 200.

Action:
- Remove or replace broken Thank-you source rows.
- Keep only reachable source-backed audio on public pages.
- Do not use unrelated songs simply to clear the audit.

Acceptance:
- /personal/thank-you has no broken audio source URLs.
- BIC audit reports no Thank-you audio failures.

### QF-002: Audit false positives for action-looking text

Status: OPEN.

Audit warns on words like Choose this KK, Use this, and Checkout even when they are inside valid anchors or locked-status labels.

Action:
- Tighten actionWordsInNonAnchorHtml.
- Ignore valid linked button text.
- Ignore approved locked-status labels.
- Keep warnings for truly dead CTAs.

Acceptance:
- Real dead CTAs still warn/fail.
- Valid linked buttons do not warn.

### QF-003: Navigation pages without audio tags

Status: OPEN.

Home, Hug, Find, and Personal index may intentionally have no audio tags.

Action:
- Mark browse/navigation pages as audioOptional in the audit.
- Keep strict audio checks for listen/buy pages.

Acceptance:
- Audit distinguishes browse pages from playable product pages.

### QF-004: Missing Supabase anon env warning

Status: OPEN.

Build warns NEXT_PUBLIC_SUPABASE_ANON_KEY is missing locally.

Action:
- Confirm local .env.local has the value if needed.
- Confirm Vercel env has required Supabase vars.
- Keep public source-backed pages independent of Supabase table uptime.

Acceptance:
- Build warning is either resolved or documented as non-blocking.

### QF-005: Wedding KK audio materialization

Status: OPEN.

Wedding selection flow is working. Full-song reference works. Exact KK audio for V2 + Ch2 and V2-End still needs final materialization/listening approval before checkout unlocks.

Action:
- Cut V2 + Ch2 first.
- Apply padding, Twinkle/page presentation, phrase-completion, and listening review.
- Then cut V2-End.

Acceptance:
- Featured KKs become playable.
- Checkout remains locked until exact approved audio exists.

## Standing BIC rules

- No visible choice without a working selection link.
- No play claim without reachable audio.
- No buy claim without a checkout handoff.
- No public route depends on Supabase table health to render.
- Failures block release only when they affect customer action, audio, payment, or page availability.
- Non-blocking warnings go here.
