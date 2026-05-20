# DISCO to 4PE Migration Plan

## Current State

DISCO is being used as a paid reference/catalog/share/playback tool.

Monthly cost is approximately $100.

## Target State

4PE becomes the owned GPMx catalog and governed media delivery system.

## Phase 1 — Inventory DISCO

For every DISCO item, capture:

- title
- artist
- DISCO share URL
- DISCO embed URL
- playlist ID
- audio playback status
- download status
- lyrics present
- notes/metadata present
- matching Supabase tracks filename
- PIX-PCK status

## Phase 2 — Build Owned Equivalents

Build internal equivalents for:

- track page
- playlist/package page
- embed/share page
- lyric/metadata editor
- Admin approval queue
- controlled download flag
- artwork field
- source URL mapping

## Phase 3 — Migrate Flagship PIX

Start with:

- Sandman's Comin'
- You Stop Talking
- Hope You Know
- I'll Always Be Around
- By Your Side
- I Do Swear
- Put Down the Phone
- Love Renews

## Phase 4 — Validate Replacement

4PE can replace DISCO when:

- active tracks play reliably
- share pages work
- lyrics/metadata are stored
- Admin can edit/review
- PIX-PCK exists
- GPMx-specific workflows work
- frontend remains simple

## Phase 5 — Reduce or Cancel DISCO

Only after replacement readiness is proven.

DISCO can remain temporarily for pitching/sync/reference if business value exceeds cost.
