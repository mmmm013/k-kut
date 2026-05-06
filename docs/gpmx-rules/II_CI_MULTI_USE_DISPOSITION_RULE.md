# II/CI Multi-Use Disposition Rule

## Core Rule

An II/CI may appear in unlimited search results when each appearance represents a distinct valid use case, emotional lane, recipient context, season, holiday, or traditional greeting-card purpose.

Repeated appearance is not duplication unless the same asset appears more than once for the same use case, same emotional lane, same recipient context, and same product intent without added value.

## Object Model

Asset = the actual KK, mK, CC, LineFeel, hook, phrase, section, or song moment.

Use Case = why the asset appears for a user.

Search Result = one presentation of one asset for one use case.

Disposition = the 4PE decision for that asset/use pairing.

## Disposition Values

- APPROVE_PRIMARY
- APPROVE_SECONDARY
- APPROVE_SEASONAL
- APPROVE_TRADITIONAL
- APPROVE_TUG_SECONDARY
- HOLD_FOR_REVIEW
- REJECT_FOR_THIS_USE
- REJECT_ASSET

## Evaluation Fields

Each II/CI use pairing should evaluate:

- asset_id
- asset_title
- source_song
- use_case
- emotional_lane
- product_intent
- recipient_context
- occasion_context
- traditional_use
- seasonal_use
- hug_score
- tug_score
- fit_strength
- disposition
- disposition_reason
- download_allowed
- share_mode

## Product Control

Repeated use never authorizes raw audio download.

HUGs and TUGs remain private K-KUT links unless GPM intentionally sells a full-song download product.

## KKr-BIZ-MSC Rule

KKr-BIZ-MSC must identify both:

1. already-used II/CI appearances
2. unused or never-CCd LineFeel opportunities

The same asset may be approved for multiple lanes, but each lane must have its own disposition.
