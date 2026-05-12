# K-KUT Global Fair Access Pricing Rules

## Purpose

K-KUT may support fair-access pricing for buyers in different countries, regions, and economic contexts.

The goal is to make HUG access more realistic globally without weakening the value of the work, confusing buyers, or creating uncontrolled discounts.

## Core Rule

Pricing may be adjusted by country, currency, purchasing-power tier, partner program, or manual hardship review.

Pricing must not be adjusted by language alone.

A language is not a market.

Spanish, English, Arabic, French, Portuguese, Chinese, and many other languages are used across many countries with very different cost structures.

## Approved Internal Name

Global Fair Access Pricing

Other acceptable internal labels:

- Country Affordability Tier
- PPP Pricing Tier
- Regional Access Price
- Community Access Price
- Sponsored Access

## Approved Public Language

Use buyer-safe language such as:

> Fair-access pricing may be available by country.

> Some regions may qualify for adjusted access pricing.

> Community access pricing may be reviewed manually.

Do not use public language such as:

- cheap-country pricing
- poor-country pricing
- third-world pricing
- non-Western discount
- poverty pricing
- foreign discount
- language discount

## Pricing Basis

Pricing may consider:

- buyer country
- recipient country
- billing country
- currency
- local affordability
- partner or nonprofit context
- school, church, memorial, community, or ministry use
- manual hardship review
- campaign-specific access rules

Pricing must not be based only on:

- selected language
- recipient language
- non-English status
- ethnicity
- race
- religion
- assumptions about the buyer
- assumptions about the recipient

## First Version Rule

First version must be manual-safe.

No fully automatic global price change should be pushed to public checkout until:

- country detection is reliable
- currency handling is clear
- Stripe pricing behavior is tested
- discount logic is reviewed
- abuse controls exist
- public copy is approved
- refund/support language is approved

## Pricing Tiers

### Tier A — Standard

Default price.

Used for:

- U.S.-like pricing
- high-income countries
- default checkout
- unknown country
- unsupported country
- unsupported currency

### Tier B — Access

Adjusted access price.

Used for:

- upper-middle affordability contexts
- countries where standard U.S. pricing may be high
- reviewed regional access programs

### Tier C — Community Access

Deeper adjusted price.

Used for:

- lower-middle affordability contexts
- community, school, ministry, nonprofit, memorial, or special campaign access
- manual review recommended

### Tier D — Sponsored / Manual

Manual-only price.

Used for:

- low-income country access
- hardship requests
- nonprofit/community partner access
- grief/memorial cases
- manually sponsored HUGs
- zero-price or donor-supported cases

Tier D must not be fully automated in first version.

## Language Connection

Language localization and pricing are separate.

Language controls:

- buyer prompts
- recipient-facing message
- TUG guidance
- checkout support copy
- delivery instructions

Pricing controls:

- country
- currency
- affordability tier
- campaign
- partner/manual review status

Hard rule:

> Never lower price automatically just because the buyer selects a non-English language.

> Never raise price automatically just because the buyer selects English.

## HUG / KUT Audio Rule

Fair-access pricing does not change audio law.

No external audio.

No fake translated audio.

No placeholder audio.

No disguised audio.

No translated song-audio claim unless the exact translated audio is controlled, approved, cataloged, and legally usable.

## Checkout Rule

First public checkout version should remain simple:

- default standard price
- optional access review language
- no automatic country-price mutation unless specifically approved
- no SMS automation
- no public download
- private HUG link remains controlled delivery object

## Suggested Data Fields

A pricing tier record may include:

- tier_id
- public_label
- internal_label
- description
- checkout_enabled
- manual_review_required
- suggested_multiplier
- allowed_product_families
- notes

A country pricing record may include:

- country_code
- country_name
- pricing_tier
- currency_code
- public_enabled
- manual_review_required
- notes

## Hard Stops

Do not expose internal pricing logic to buyers.

Do not describe countries with insulting or discriminatory language.

Do not use language as a proxy for poverty.

Do not auto-apply deep discounts without review.

Do not change Stripe checkout pricing until tested.

Do not imply all countries have local currency support until Stripe setup confirms it.

## Correct First-Version Promise

> Fair-access pricing may be available by country or community context. Some requests may require manual review.
