# KKr Title Split — Internal Authority vs Frontend Buyer Match

## Locked Rule

Titles are for GPM control only.

PIX titles, work titles, filenames, artist names, and source names may be used internally for:

- search
- source authority
- rights traceability
- lineage
- QA
- reports
- Gregory review
- audit

They do not decide frontend buyer match.

## Frontend Rule

The frontend is driven by:

- buyer_label
- product_lane
- theme_tags
- intent_tags
- recipient_tags
- tone_tags
- buyer_short_copy
- MC-BOT narrowing metadata
- finished II delivery path

Default frontend title mode:

HIDE_SOURCE_TITLE

Allowed frontend_title_mode values:

- HIDE_SOURCE_TITLE
- SHOW_BUYER_LABEL_ONLY
- SHOW_TITLE_AFTER_SELECTION
- SHOW_TITLE_ADMIN_APPROVED

## Object Split

Internal identity:

- internal_work_title
- internal_pix_title
- internal_artist_or_kreator
- source_audio_path
- pix_id
- kk_id
- section_label
- start_time
- end_time

Frontend identity:

- buyer_label
- product_lane
- buyer_short_copy
- theme_tags
- intent_tags
- recipient_tags
- tone_tags
- ii_delivery_path

## Release Law

Raw PIX audio is never public.

Raw KK audio is never public.

Customer playback requires a finished II / DP object with padding and Twinkle baked into the saved file.

## 4PE-BIZ-MSC LL / BP / DO

LL:
Title-based public matching causes confusion and weak buyer experience.

BP:
Separate internal catalog identity from buyer-facing emotional routing.

DO:
Every KKr / K-KUT / HUG row must carry both internal authority fields and frontend buyer fields, with frontend_title_mode controlling title exposure.
