# GPMx User Intent and CRM Capture Rule

## Purpose

GPMx must capture user intent so K-KUT can fulfill sincere, emotionally accurate HUGs and TUGs without losing buyer context.

## Core Rule

Every meaningful user action in a HUG/TUG flow should produce a structured event.

4PE captures.
KKr proves fit.
MC-BOT leads.
Owner can review.
Checkout fulfills.

## Required Capture Events

- page_view
- mc_bot_greeted
- feeling_entered
- feeling_interpreted
- set_presented
- option_previewed
- option_selected
- delivery_preference_selected
- checkout_clicked
- support_clicked
- order_completed
- hug_link_created
- hug_link_shared

## Required Fields

Each event should include:

- event_type
- session_id
- created_at
- source_page
- product_family
- holiday_set
- sentiment_product_type
- typed_feeling
- interpreted_feeling
- selected_hug_id
- selected_hug_title
- delivery_preference
- consent_sms
- consent_email
- customer_email
- customer_phone
- checkout_session_id
- order_id
- metadata

## Delivery Preference Rules

Available delivery preferences:

- email
- dm
- social_link
- own_text
- twilio_sms_later

Twilio SMS must remain disabled until A2P 10DLC campaign approval is verified.

Manual text from the buyer’s own phone is allowed because the buyer is personally sending the private HUG link.

## Consent Rules

SMS consent must be voluntary, specific, and separate.

SMS consent cannot be required to complete purchase.

SMS consent cannot be bundled into Terms or Privacy acceptance.

SMS checkbox must be unchecked by default if introduced.

## Vocal Input Rule

If vocal input is added later:

- user must intentionally tap to record
- UI must disclose that voice input/transcript will be saved
- recording must be saved only with consent
- transcript and interpreted feeling must be tied to the session
- raw voice files are not public product assets

## Product Control

HUGs and TUGs are private hosted links, not raw audio downloads.

Full song downloads are allowed only when GPM intentionally sells a full-song download product.

## No UI Change Rule

This document defines capture requirements.

It does not authorize a UI change.
