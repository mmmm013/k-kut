# Render checkout configuration

`K_KUT_DEPLOYMENT_ENV=production` enables the same production environment check
used on Vercel. It does not approve an II or enable payment by itself.
Leave it unset for a Render preview. Existing Vercel deployments continue to use
`VERCEL_ENV` when the application variable is absent.

Checkout also requires the existing payment rollout date, an enabled rollout,
Stripe credentials, the pending-order database configuration, and an exact
released public option with its family and locked price. Copy existing authorized
values through the hosting environment UI; never commit credentials.

The public catalog and product grid now suppress purchase availability when the
production environment, rollout, or Stripe key is absent. An empty public catalog
reports `NO_PUBLIC_OPTIONS`; a catalog with playback but disabled checkout reports
`PREVIEW_ONLY`. Neither state changes FullMix acceptance or KUT boundary/release
approval.

## Regression and performance checks

- `node scripts/test-checkout-host-availability.mjs`: isolated environment matrix;
  no payments or external calls.
- With a production build running locally:
  `KKUT_TEST_BASE_URL=http://127.0.0.1:3000 node scripts/test-ii-use-cases-performance.mjs`.
- The route harness performs GET-only probes on remote hosts. Malformed POST cases
  run only against localhost. It reports functional failures and response latency
  separately, writes JSON to `KKUT_TEST_REPORT` (default `/tmp/kkut-matrix.json`),
  and exits nonzero when a functional check fails.
- Local concurrency is 5 requests, 140 total; remote concurrency is 2, 21 total.
  This is a bounded diagnostic sample, not a production capacity claim or Web
  Vitals benchmark. It cannot prove playback/payment/delivery with no released
  catalog records.
