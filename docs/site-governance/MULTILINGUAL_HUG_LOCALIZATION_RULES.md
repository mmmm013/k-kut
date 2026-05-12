# K-KUT Multilingual HUG Localization Rules

## Purpose

K-KUT may support global-language buyer experiences by translating the HUG interface, buyer prompts, TUG guidance, recipient messages, and delivery instructions.

This does not mean the song audio is translated.

Core rule:

> Translate the HUG experience.
> Do not claim translated audio unless controlled translated audio exists.

## Public Promise

Approved public direction:

> Write your message in the language that feels right.
> We help shape the HUG experience for the recipient.
> The music moment remains source-controlled.

## Hard Audio Rule

No fake translated audio.

No AI-generated replacement audio.

No external audio.

No placeholder audio.

No disguised audio.

No claim that a KUT, HUG, or song moment exists in another language unless that exact audio source is approved, cataloged, and controlled.

A translated message layer is allowed.

A translated audio claim is not allowed unless the translated audio is real and approved.

## What May Be Translated

The following may be localized:

- public page labels
- buyer prompts
- Find-the-right-words prompts
- TUG helper language
- recipient message templates
- timed delivery instructions
- private HUG link instructions
- holiday page labels
- romance category labels
- checkout-support language
- confirmation language
- manual fulfillment notes

## What Must Stay Controlled

The following must not be loosely translated or altered without review:

- song title
- artist/source identity
- KUT identity
- catalog/source proof
- legal ownership language
- audio availability
- delivery rights
- download permission
- SMS permission
- payment/checkout terms

## Phased Rollout

Do not begin with 200 public languages at once.

Use phased rollout:

1. Top 10–20 languages
2. Top 50 languages
3. Top 100 languages
4. Top 200 languages

Each phase must be tested before public expansion.

## Emotional Review Rule

Machine translation alone is not enough for sensitive HUG/TUG content.

Require review for:

- romance
- grief
- apology
- memorial language
- faith/religious wording
- family honor language
- wedding/vow language
- private intimate messages
- difficult relationship repair
- culturally specific holidays

## TUG Translation Rule

TUG may help the buyer shape a message across languages.

TUG may support:

- softening language
- clarifying emotional intent
- translating the buyer message
- choosing culturally suitable wording
- avoiding harsh or awkward phrasing
- preparing recipient-facing text

TUG must not fabricate facts, promises, family relationships, religious claims, or audio availability.

## IOI / DP Connection

Language is part of routing.

A buyer request may include:

- ioi_primary
- ioi_secondary
- requested_language
- recipient_language
- buyer_language
- translation_needed
- tug_required
- tug_reason
- dp_selected

If the buyer’s language and recipient’s language differ, TUG review should be considered.

## Timed Delivery Connection

Timed HUG Delivery may use localized instructions.

Examples:

- birthday morning delivery
- holiday morning delivery
- anniversary evening delivery
- memorial-date delivery
- cross-time-zone delivery

Timed delivery must still follow:

- docs/site-governance/TIMED_HUG_DELIVERY_RULES.md

## Seasonal Connection

Holiday and campaign pages may show localized public copy.

Seasonal localization must still follow:

- docs/site-governance/SEASONAL_LANING_RULES.md

Holiday pages explain.

Campaign pages sell.

Archive pages preserve.

Localization must not turn an archived campaign into an active selling page.

## Public Language Rule

Do not expose internal terms publicly:

- IOI
- DP
- TUG
- KKr
- mK
- PIX
- LLF
- source pool
- candidate inventory
- routing logic
- localization layer
- language routing

Use public words:

- language
- message
- feeling
- recipient
- private HUG link
- delivery time
- help me say it

## Top-Language Data Recommendation

Future language records should support:

- language_code
- language_name_english
- language_name_native
- direction
- public_enabled
- review_required
- supports_romance
- supports_grief
- supports_apology
- supports_holiday
- notes

## Fulfillment Record Recommendation

Future fulfillment records may include:

- buyer_language
- recipient_language
- requested_language
- translated_message
- original_message
- translation_review_required
- translation_review_status
- cultural_sensitivity_flag
- localized_delivery_instructions
- manual_review_required

## Hard Stop

Do not promise fully automatic global translation until review, storage, fallback, and legal copy controls are ready.

Do not imply K-KUT owns or delivers translated song audio unless that exact translated audio is approved and cataloged.

The correct first-version promise is:

> We can help prepare recipient-facing HUG messages in other languages, with review for sensitive moments.
