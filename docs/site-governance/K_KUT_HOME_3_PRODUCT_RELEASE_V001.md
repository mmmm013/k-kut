# K-KUT Home Three-Product Release V001

## GD authority

The public K-KUT homepage presents exactly three settled customer products:

- Short KUT — $4.99
- HUG — $7.99
- Big HUG — $12.99

## Controlled starter items

The first income-ready homepage uses one already-existing, playable item for each product promise:

| Product | Exact inventory ID | Public audio | Promise |
|---|---|---|---|
| Short KUT | `thank-you-cc-012` | `/mothers-day/thank-you/kks-expanded/thank-you-cc-012.mp3` | One focused real-audio greeting from the song. |
| HUG | `thank-you-sec-ch1` | `/hug-delivery/thank-you/thank-you-sec-ch1-ii-delivery.mp3` | A fuller real-audio greeting with the heart of the song. |
| Big HUG | `thank-you-kk7` | `/mothers-day/thank-you/kks-expanded/thank-you-kk7.mp3` | A larger real-audio greeting with the strongest emotional arc. |

No generic public labels such as KK1, KK2, or raw inventory filenames appear on the homepage.

## Checkout and delivery controls

- One exact item per purchase.
- Existing approved Stripe payment relationships only.
- Short KUT uses `NEXT_PUBLIC_MD_MOMENT_KK_LINK`.
- HUG uses the existing approved Regular HUG Payment Link.
- Big HUG uses `NEXT_PUBLIC_MD_FEATURED_KK_LINK`.
- The exact inventory ID and public product name are written to the existing H2 pending-order authority before Stripe.
- Stripe remains the durable paid-order authority.
- Every paid order requires manual review before private link delivery.
- No uncontrolled public download.
- No automatic SMS.

## 2,611-item catalog boundary

The full 2,611-item public catalog remains mapped only to the proven $7.99 HUG offer. This homepage release does not bulk-remap those 2,611 items to Short KUT or Big HUG.

## Audio controls

- Existing audio files are referenced; no source audio is changed.
- No new audio inventory is created.
- Final delivery remains subject to the canonical GPMx Twinkle-at-end requirement and manual review.
