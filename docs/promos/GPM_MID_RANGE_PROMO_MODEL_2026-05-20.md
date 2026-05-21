# GPM Mid-Range Promo Model — K-KUT / HUGs

## Status

Working revenue model. Use for pricing, packages, fulfillment, checkout routing, and investor/grant planning.

## Core Thesis

Mid-range promos are the revenue engine.

They convert emotional interest into higher-trust, higher-average-order-value packages.

The viral layer gets users to hear, understand, and share. The mid-range layer sells more complete, reviewed, guided, or bundled experiences.

## Mid-Range Goal

Create paid offers that are valuable enough to support:

1. Higher price points.
2. Human review.
3. Better fulfillment.
4. Repeatable margins.
5. Stronger testimonials.
6. Better grant/investor proof.

## Public Positioning

Mid-range products should not sound like complex technology.

Preferred framing:

> A curated private music gift, built around a real song moment.

Other usable lines:

- More personal than a card.
- More lasting than a text.
- A reviewed music HUG for an important moment.
- A private song moment, selected with care.
- For the moments where the right song matters.

## Pricing Architecture

Suggested early model:

### Routine Personal HUG

- Price: low single-purchase entry price.
- Role: standard checkout path.
- Examples: Birthday, Thank You, Apology, Encouragement, Thinking of You.

### Curated HUG Pack

- Price: mid-range.
- Role: multiple options, more guidance, better delivery.
- Examples: Anniversary Pack, Family Pack, Sympathy Pack, Kids Birthday/KFS Pack.

### Event / Ceremony Pack

- Price: higher mid-range.
- Role: more intentional, reviewed, time-sensitive.
- Examples: Wedding Track Pack, Memorial/Celebration of Life Pack, Business Client Appreciation Pack.

## Priority Mid-Range Promos

### 1. Wedding Track Pack

Status:

Highest priority mid-range promo.

Known product:

- `Wedding Track Pack`
- Feature: `Forever and a Day`
- Dedicated Stripe link exists.

Use case:

- first dance
- couple gift
- wedding-party thank-you
- family blessing
- ceremony/private keepsake

Required promise:

> A reviewed wedding song package built around a real music moment.

Must remain separate from routine low-price HUG checkout.

Fulfillment requirements:

1. Confirm buyer/couple intent.
2. Confirm selected song moment.
3. Confirm public/private use.
4. Confirm delivery format.
5. Preserve source audio and chosen section.
6. Send private link or reviewed package.

### 2. Anniversary Pack

Use case:

- spouse/partner anniversary
- long-term relationship
- memory marker
- “still choosing you” message

Public hook:

> Mark another year with a private song moment.

Possible package contents:

- one selected Anniversary HUG
- one optional alternate cut
- suggested message text
- private delivery link
- future reminder / next-year follow-up

### 3. Sympathy / Memorial / Celebration of Life Pack

Use case:

- loss
- grief
- memorial service
- remembrance
- hard dates

Public hook:

> A gentle music moment when words are difficult.

Must be handled with care.

Fulfillment requirements:

- calm language
- no hype
- no manipulative urgency
- optional human review
- private delivery only by default

### 4. Business Client Appreciation HUG

Use case:

- client thank-you
- campaign/promo use
- local business gift
- donor/supporter appreciation

Public hook:

> Thank clients with a private music moment they remember.

Possible package contents:

- small batch of private HUG links
- light customization
- simple tracking
- optional business message

### 5. Family / Kids / KFS Pack

Use case:

- kids birthday
- classroom
- singalong
- family encouragement
- child-safe music moments

Public home:

- `thesingalongs.com`

K-KUT role:

- governed delivery for approved Awesome Squad / KFS song moments.

Rules:

- Keep KFS clearly child/family-safe.
- Do not mix with adult romance, apology, grief, or heavy personal lanes.
- Use cross-links only where context is clear.

### 6. Custom Curated HUG Bundle

Use case:

- buyer wants more help choosing
- multiple recipients
- family pack
- special date

Public hook:

> We help you choose the right private music HUG.

Must be constrained. Do not offer unlimited custom editing.

Allowed:

- choose among approved KUTs/HUGs
- guided selection
- reviewed delivery

Not allowed:

- customer section editing
- stitching non-contiguous KUTs
- rearranging song sections
- exposing PIX-PCK or CC internals

## Checkout Requirements

Every mid-range promo must preserve:

1. Product.
2. Source or KUT id.
3. Price tier.
4. Buyer email.
5. Recipient info if supplied.
6. Fulfillment status.
7. Delivery link status.
8. Source audio path.

Current minimum routing:

- `product=wedding` routes to Wedding Track Pack Stripe.
- routine products route to Personal HUG Stripe.

Future preferred routing:

Use Stripe Checkout Sessions with:

- `client_reference_id`
- product metadata
- source/KUT metadata
- fulfillment metadata
- webhook-created order record

## Fulfillment Model

Mid-range products need a lightweight fulfillment queue.

Recommended statuses:

1. `checkout_started`
2. `paid`
3. `source_confirmed`
4. `review_needed`
5. `approved`
6. `delivered`
7. `recipient_opened`
8. `closed`

## Metrics

Track:

1. Product page visits.
2. Audio plays.
3. Checkout starts.
4. Paid conversions.
5. Average order value.
6. Fulfillment time.
7. Gross margin.
8. Refund/support burden.
9. Recipient opens.
10. Repeat buyers.

## Margin Considerations

Mid-range promos must avoid fulfillment chaos.

Rules:

- Sell reviewed packages, not infinite customization.
- Keep song choices inside approved lanes.
- Preserve source record and delivery proof.
- Do not promise custom edits until workflow is governed.
- Use MC-BOT for guided selection, not open-ended requests.

## Build Priorities

1. Confirm Wedding Track Pack checkout and page.
2. Add Anniversary Pack as second mid-range test.
3. Add Sympathy/Memorial only when language and fulfillment are safe.
4. Add KFS/Awesome Squad family pack with thesingalongs.com ties.
5. Build a simple order/fulfillment registry.
6. Add webhook order creation.
7. Add delivery/status dashboard later.

## Operating Rule

Mid-range promos win when they feel more cared-for than a card but still simple enough to buy.

Do not sell complexity. Sell care, review, and a real song moment.
