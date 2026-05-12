# K-KUT Timed HUG Delivery Rules

## Purpose

Timed HUG Delivery lets a buyer choose the exact date and time a HUG should be delivered or released to a recipient.

This is suitable for birthdays, holidays, anniversaries, weddings, memorial dates, apologies, thank-you moments, and any emotional moment where timing matters.

Public meaning:

> Choose the feeling. Choose the moment. We deliver it when it matters.

## Public Name

Use:

- Timed HUG Delivery
- Schedule a HUG
- Schedule this HUG

Do not use public wording like:

- Schedule a DP
- Timed DP
- Delivery protocol
- Automated dispatch
- Fulfillment queue

## First-Version Rule

The first version must be manual-reviewed.

No automatic SMS.
No automatic public download.
No uncontrolled delivery.
No release without GPM review.

First version status:

> scheduled_needs_review

## Buyer-Facing Fields

A timed HUG request may collect:

- recipient_name
- recipient_contact
- delivery_method
- requested_delivery_date
- requested_delivery_time
- requested_delivery_timezone
- buyer_message
- selected_hug_id
- selected_hug_title
- source_song
- occasion
- feeling_intent

## Required Fulfillment Fields

Timed delivery fulfillment records must include:

- requested_delivery_at
- requested_delivery_timezone
- recipient_name
- recipient_contact
- delivery_method
- delivery_status
- buyer_message
- manual_review_required
- private_hug_link
- download_allowed
- sms_enabled

## Delivery Status Values

Use these internal statuses:

- draft
- paid_needs_manual_fulfillment
- scheduled_needs_review
- ready_to_deliver
- delivered
- missed_or_needs_attention
- cancelled

## Delivery Method Values

Allowed first-version values:

- private_link_manual
- email_manual
- phone_manual_review
- buyer_handles_delivery

Do not enable automatic SMS until SMS/A2P approval and compliance are complete.

## Public Copy

Approved public language:

> Schedule this HUG

> Pick the date and time you want this music moment delivered.

> Every scheduled HUG is reviewed before release.

> We prepare the private HUG link and make sure it is ready for the right moment.

## Safety and Control Rules

Timed delivery does not change K-KUT audio law.

A timed HUG must still use approved, premade, cataloged, selected-off-the-shelf song moments.

No placeholder audio.
No external audio.
No disguised audio.
No missing source proof.
No public exposure of internal pipeline terms.

## Seasonal Fit

Timed HUG Delivery supports the seasonal lane system.

Holiday pages explain.
Campaign pages sell.
Archive pages preserve.
Timed delivery controls the exact release moment.

Examples:

- Mother’s Day morning
- Father’s Day afternoon
- Birthday midnight
- Wedding morning
- Anniversary evening
- Memorial date
- Thanksgiving family moment
- Christmas morning

## First Build Recommendation

Build in this order:

1. Add the governance rule file.
2. Add timed delivery fields to fulfillment records.
3. Add buyer-facing scheduled delivery request fields.
4. Keep all scheduled HUGs manual-reviewed.
5. Add admin review before any automated delivery.
6. Only later consider automatic delivery after compliance and durable storage are ready.

## Hard Stop

Do not promise guaranteed automatic delivery until production storage, alerting, timezone handling, and manual fallback are working.

For now, the correct public promise is:

> Scheduled HUGs are reviewed and prepared for the requested delivery moment.
