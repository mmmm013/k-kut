# H2 Pending-Order Token V001

Authority: Gregory D Putnam / GD

## Decision

New K-KUT checkout requests use a Stripe-safe opaque reference:

```text
H2_<32 lowercase hexadecimal characters>
```

The exact II, optional note, BF profile, origin domain, and public product name are stored server-side before redirecting to Stripe.

## Immutable controls

- 2,611 verified IIs remain unchanged.
- Source audio remains unchanged.
- Canonical GPMx Twinkle/STI remains unchanged.
- Public price remains USD 7.99.
- The approved existing K-KUT HUG Payment Link remains unchanged.
- The optional note remains limited to 13 words and appears before HUG content.
- Stripe Checkout Session remains durable paid-order authority.
- Production fulfillment remains manual-reviewed.
- No automatic SMS or public download is created.

## Storage authority

`public.gpm_h2_pending_orders` is RLS-enabled and has no anon or authenticated table access. Only server routes holding `SUPABASE_SERVICE_ROLE_KEY` may create or consume records.

Pending records expire after 24 hours. Consumption changes status from `awaiting_payment` to `paid_received` and records Stripe event/session authority. Duplicate delivery of the same Stripe event is idempotently readable.

## Migration compatibility

The webhook continues to read:

- legacy `H1|inventory_id|personal_note`
- legacy inventory-only references

Checkout no longer creates those legacy formats.

## BF readiness

The H2 record includes:

- `bf_profile`
- `origin_domain`
- `public_product_name`
- stable core offer code `hug`

For V001, these remain `k-kut`, the active K-KUT host, and `K-KUT HUG`. Future domain payment identities require separate GD approval.

## Explicit non-actions

This implementation does not:

- create a Stripe Product, Price, or Payment Link
- bind a domain
- deploy production
- modify inventory
- modify or copy audio
- change price
- automate fulfillment
