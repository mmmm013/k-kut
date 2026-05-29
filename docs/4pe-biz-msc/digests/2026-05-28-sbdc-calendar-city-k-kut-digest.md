# 4PE-BIZ-MSC Digest — SBDC / Calendar / City / K-KUT Ops

Date: 2026-05-28
Status: ACTIVE DIGEST

## BP — Business Problem

GPM / K-KUT / HUG work is moving across several active tracks at once:

1. Customer-facing K-KUT.com stability.
2. SBDC / business-support scheduling.
3. City / manufacturing / facility outreach.
4. Patent / USPTO support.
5. Calendar and missed-event risk.
6. Transfer of live K-KUT learning into flagship gputnammusic.com.

The risk is not lack of work. The risk is fragmentation.

## LL — Learned Lessons

### K-KUT operational lesson

Single-audio playback is required as a customer-facing rule:
- fewer than two previews may play at the same time
- only one audio preview may be active
- this must be global, not page-specific

A failed deploy occurred when `SingleAudioPlaybackGuard` was referenced during prerender without being correctly bound/imported in the build path. The failure hit multiple prerendered routes, proving it was a global shell issue, not an isolated HUG page issue.

### HUG language lesson

Public customer language should lead with:
- HUG
- feeling
- choice
- send

Public candidate cards should not expose internal/NVA phrases:
- locked SSOT language
- raw KKr doctrine
- unnecessary structure terms when they do not help the user

MC-BOT stays visible as guide / usher / shield.

### Business-support lesson

SBDC and CISBDC are active support lanes and should be treated as external development partners.

The user needs help with:
- commercialization planning
- business plan / projections
- funding-readiness
- customer acquisition
- manufacturing / assembly / facility planning
- local / legal / university / economic-development referrals

### Calendar lesson

The user needs daily event protection:
- check today
- check current week
- warn about conflicts
- track missing links
- track unsent replies
- preserve carryover

## BP→DO — Current Decisions

### SBDC / IWU

Molly Cavazos / Illinois Wesleyan SBDC:
- meeting hold created for Wednesday, June 3, 2026, 10:00–10:45 AM Central
- virtual preferred
- official link may still come from Molly
- user must be reminded daily until complete

### Central Illinois SBDC

Judy Tavernor / CISBDC:
- positive support lane
- no-cost advising requested
- Zoom or phone preferred
- registration may be required before appointment

### City / manufacturing

Greenfield remains the clearest city lead.
BNEDC remains an active regional support path.
Other cities require follow-up / status pass.

### K-KUT.com

K-KUT.com must be finished enough for customer use before flagship transfer.

Immediate K-KUT finish priorities:
1. Confirm global single-audio guard is correctly imported and build-safe.
2. Confirm one-preview-at-a-time behavior live.
3. Seed Personal and Holiday candidate lanes.
4. Remove NVA internal phrases from candidate cards.
5. Keep MC-BOT guide language.
6. Keep HUG-first user language.
7. Maintain BIC gates.

## DO — Next Actions

1. Fix/verify `SingleAudioPlaybackGuard` global import.
2. Run build locally before deploy.
3. Deploy only after successful build.
4. Confirm `/hug` live.
5. Confirm one audio preview only.
6. Confirm Personal and Holiday visible.
7. Confirm MC-BOT visible.
8. Confirm no customer-facing “Locked Thank You text-structure K-KUT from SSOT.”
9. Prepare for SBDC meeting.
10. Follow up with Greenfield / BNEDC after K-KUT finish.

## Carryover

- USPTO account/support emails exist, but no substantive patent filing response found yet.
- A2P/Twilio monitoring remains active.
- Daily morning action-item gathering is active.
- Daily event notification is active.
- Flagship domain update is next major project after K-KUT handoff.

## 4PE-BIZ-MSC Law Captured

Prototype content teaches the engine.
Prototype content does not become the engine.

K-KUT.com sells HUGs.
gputnammusic.com carries broader authority, invention proof, Heroes/MIP1, Business lanes, and GPMx/4PE doctrine.

Customer path must remain simple.
Operational proof must remain rigorous.
