# K-KUT Localization Admin Preview Rules

## Purpose

The localization admin preview page exists to review controlled HUG localization copy, rollout status, audio-safety rules, and fair-access pricing tiers before anything becomes buyer-facing.

Route: /admin/localization-preview

## Access Rule

This route is internal-only and must remain token-gated.

Access requires the Vercel Production environment variable: ADMIN_PREVIEW_TOKEN

The live preview URL must include the token query parameter: /admin/localization-preview?token=...

If the token is missing or incorrect, the page must return 404.

## Search Engine Rule

The page must remain noindex and nofollow.

Required behavior: robots noindex, nofollow

## Buyer-Facing Rule

This page is not a public multilingual launch page.

It must not be linked from buyer navigation, campaign pages, holiday pages, personal pages, checkout, or public HUG pages.

## Checkout Rule

This page must not change live checkout behavior.

It may display pricing governance and tier data, but it must not activate automatic country, language, currency, or affordability pricing.

## Language Rule

Only approved public-enabled languages may be shown to buyers.

Non-English languages remain review-required unless specifically approved.

## Audio Rule

The page must preserve this rule: Translate the HUG experience. Do not claim translated audio unless controlled translated audio exists.

Public copy must not imply translated song audio unless exact controlled translated audio exists.

## Current Verified Behavior

As of the protection commit, the route was verified:

NO TOKEN: HTTP 404
WITH TOKEN: HTTP 200
