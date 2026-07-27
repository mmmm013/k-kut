# MC-BOT Public Inventory Stop-the-Line — 2026-07-27

## Customer evidence

Production customer playback of the first `bad-day` result, displayed as `K-KUT 00009 · 01`, produced an approximately 32-second MC-BOT spoken script containing no music.

## Existing laws that were bypassed

- Every customer-facing II must contain authorized music.
- Every II must derive from an LT-PIX SSOT parent.
- The LT-PIX parent must itself be strict-music-proven.
- MC-BOT / no-music audio is never musical inventory.
- Known or suspected MC-BOT/no-music evidence is a hard public block.

## Pinpoint failure point

`app/api/public-ii-catalog/route.ts` converted catalog rows to public purchasable records using only inventory family, URL prefix, public-storage status, Twinkle-at-end, and expected counts. It did not consume LT-PIX SSOT authority, source SHA, strict-music proof, MC-BOT/no-music block status, or customer audio QA.

`app/checkout/route.ts` independently repeated the same insufficient storage/Twinkle/family check and therefore could allow a contaminated record to reach checkout.

The old `audit-sentimeant-use-case-01-bad-day.mjs` was a static source-string audit, not a customer audio KPI. Its PASS did not prove music was present.

## Isolation scope

The entire last-advertised 2,611-item KK public lane is isolated as unproven/contaminated until per-row revalidation. This incident record does not claim that every row was individually listened to; the lane is isolated because its release process lacked the absolute required proof.

## Stop-the-line state

- Public audio: 0
- Purchasable IIs: 0
- Checkout: blocked
- Delivery selection: blocked
- Sentimeant 13 use-case audit: stopped

## Required release packet per II

1. inventory ID
2. LT-PIX SSOT parent ID
3. LT-PIX parent audio SHA-256
4. customer audio SHA-256
5. authorized music source status
6. strict music gate status
7. known MC-BOT/no-music SHA block status
8. human customer-audio QA status
9. Twinkle-at-end status
10. rights status
11. identity status

Any missing, false, unknown, held, or contradictory field blocks the II.
