# Free weekend checkout

Owner instruction: free weekend orders; regular prices for new checkout sessions from September 21, 2026, 00:00:13 America/Chicago (05:00:13 UTC).

The server quotes zero from September 18, 00:00 America/Chicago through the exclusive cutoff. New sessions thereafter use the unchanged HUG 799, TUG 499, BUG 199 cent prices. A session already created free remains free. No later charge, subscription, or saved-payment-method billing is introduced. This shared checkout currently supports HUG/TUG/BUG; it does not implement Holiday or Story add-on checkout.

Stripe Checkout no-cost line items do not collect a payment method. Free sessions are processed via checkout.session.completed and do not require a PaymentIntent. See https://docs.stripe.com/payments/checkout/no-cost-orders.

Validation requires a completed zero-total no_payment_required session, USD, the known promotion, Stripe's session creation timestamp within the window, and exact approved product and regular-price metadata. Signed callbacks can arrive after the cutoff. Private records distinguish free from paid orders. Existing storage failure/retry behavior and manual delivery remain in effect.

## Deployment requirements

- K_KUT_DEPLOYMENT_ENV=production on Render (or existing VERCEL_ENV=production).
- Existing controlled rollout gate still applies: K_KUT_PAYMENT_LINKS_START_DATE must be at least two UTC calendar days earlier, and K_KUT_PAYMENT_LINKS_FORCE_DISABLE must not be 1. To open September 18 under that gate, use 2026-09-16. Do not represent these variables as configured without runtime evidence.
- Existing Stripe, webhook, and private Supabase settings must be valid.
- At least one genuinely approved public product is required. Pricing changes do not approve or publish held inventory.
- No cron or midnight redeploy is needed: each new checkout request evaluates the cutoff. Server product grids use noStore so fresh page requests see current prices.

## Verification and launch blockers

Production build passed. scripts/test-free-weekend.cjs covers cutoff boundaries, regular prices, invalid free claims, real Stripe signature verification, real webhook handling with stub storage, and real checkout route parameters with stub Stripe transport. Other existing payment/storage, recipient playback, non-SMS and checkout host tests passed. These are isolated tests, not a real Stripe purchase or real delivered gift.

Live audit September 18: /api/public-ii-catalog returned NO_PUBLIC_OPTIONS with inventoryCount=0 and purchasableCount=0. The private database contained zero k_kut.paid_fulfillment_recorded events. Live webhook rejected an unsigned request; live recipient playback rejected a malformed token. No real recipient plays consumed.

Customer launch remains blocked: approved inventory is empty, delivery is manual, and no live order-to-recipient-playback test has completed. Existing active private grants are not evidence of a working new-order delivery flow.
