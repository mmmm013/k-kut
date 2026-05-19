# PKK Current-State Proof — 2026-05-18

## Status

Current-state proof required before any further domain work.

## Repo

~/k-kut

## Core Public Rule

KK-only public buyer flow.

No public mKs / mini-KUTs unless explicitly re-approved.

## EOF Signature Proof State

Component:
components/EofSignatureAudio.tsx

Public Signature asset:
public/mothers-day/signatures/get-so-down-4m11-4m19-soft-signature.mp3

Thank You page:
app/mothers-day/thank-you/page.tsx

Current default:
DEFAULT_SIGNATURE_LEAD_SECONDS = 1.5

Current Thank You prototype override:
leadSeconds={3.0}

Button copy:
Send this HUG

## Backend Truth Rule

Tail / Signature is playback-only.

No backend duration change.

No PIX / KK / CC source-truth change.

No ownership-reporting tail.

## Patent Relevance

This current state supports claims for:

- governed source custody
- exact-reference derivative objects
- presentation-layer delivery treatment separate from source truth
- audit separation between true media object and user-facing playback experience

## Required Proof Commands

Run:

```bash
cd ~/k-kut

grep -RIn "DEFAULT_SIGNATURE_LEAD_SECONDS\|leadSeconds\|onTimeUpdate\|onEnded" components/EofSignatureAudio.tsx

grep -RIn "EofSignatureAudio\|Send this HUG\|Buy this K-KUT" app/mothers-day/thank-you/page.tsx

ls -lh public/mothers-day/signatures/get-so-down-4m11-4m19-soft-signature.mp3

npm run build

git status --short
```


## Current Prototype Timing Correction

Default EOF Signature lead: 1.5 seconds before EOF.

Current Thank You prototype override: 3.0 seconds before EOF.

The Signature / Tail remains playback-layer only and is not part of PIX, KK, CC, source duration, or backend ownership reporting.
