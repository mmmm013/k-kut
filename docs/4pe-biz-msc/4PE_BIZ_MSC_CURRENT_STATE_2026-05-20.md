# 4PE-BIZ-MSC Current State — 2026-05-20

## Purpose

4PE-BIZ-MSC is the business mission-control layer for turning K-KUT / 4PE / GPMx assets into sellable, governed offers.

It exists to answer one question:

Can we sell KUTs now, safely, honestly, and in a way that supports the larger 4PE invention?

Current answer:

Yes, narrowly, through controlled beta/manual fulfillment.

## Immediate Sales Doctrine

Customers may buy:

- one governed KUT
- one governed KK / K-KUT
- one approved KK-Combo
- one reviewed package, such as the Wedding Track Pack

Customers may not:

- rearrange song sections
- build custom edits
- access PIX-PCK internals
- access CC records
- access backend IIs
- receive raw masters by default
- download audio unless specifically allowed

## Hard Glossary

### PIX

Canonical source audio / parent asset.

### PIX-PCK

Backend governance package around a PIX.

### CC / Copy-Capture

Backend capture mechanism.

CC is not a product.

CC captures exact excerpts from exact SSOT audio URLs and produces or anchors IIs.

### II

Backend inventory / identity object.

### KUT / KK / K-KUT

Customer-facing governed music moment.

### KK-Combo

Approved contiguous-only combination of KKs / song sections.

### HUG / TUG

Delivery experience.

### MC-BOT

Guided sales and delivery agent.

### DISCO

Temporary paid reference/catalog/share/playback infrastructure.

### 4PE

Owned architecture and eventual DISCO replacement.

### Supabase / SB

Current infrastructure, not the architecture itself.

## Current Sellable / Near-Sellable Products

### 1. I'm Sorry KUT HUG

Status:
- strongest immediate candidate
- route live
- native apology KUTs proven in Supabase `kuts`
- needs checkout preservation proof

Known assets:
- KLEIGH - Sorry 1
- KLEIGH - Sorry 2
- KLEIGH - Sorry 3

Suggested price:
$9 beta

Fulfillment:
manual/private link until automation is proven.

### 2. Best Birthday KUT HUG

Status:
- route live
- audio sources proven
- checkout preservation still needs proof

Known assets:
- Best Birthday
- Best Birthday - Long

Suggested price:
$9 beta

### 3. Awesome Anniversary KUT HUG

Status:
- route live
- audio source proven
- checkout preservation still needs proof

Known asset:
- Awesome Anniversary

Suggested price:
$9 beta

### 4. Forever & A Day Wedding Track Pack

Status:
- route live
- audio source proven
- dedicated Stripe link found
- should remain separate from routine low-price HUG checkout
- reviewed/manual fulfillment preferred

Known asset:
- Forever & A Day

Suggested price:
$49 initial reviewed package

## Current Public Route Proof

Known live route class:

- `/personal/apology?intent=im-sorry`
- `/personal/birthday`
- `/personal/anniversary`
- `/personal/wedding`

Each returned HTTP 200 during May 20 testing.

## Current Git / Repo State

Recent pushed commits include:

- `7b6688d` Add Sandman KK combo and async placement tooling
- `cf067fb` Create KUT sales release registry
- `0b5d361` Select You Stop Talking PIX SSOT
- `e4ec569` Start DISCO to 4PE migration registry
- `c6edcb2` Add DISCO to 4PE feature parity checklist
- `8379d13` Define 4PE as DISCO replacement path

Current known uncommitted files:

- `.gitignore`
- `app/hug/page.tsx`

These should not be touched casually while resolving email/admin issues.

## Email / Proofpoint Situation

Current issue:

Mail to `gputnam@gputnammusic.com` and `gputnam@2gdp.com` is unreliable or inaccessible.

Known infrastructure:

- GoDaddy Email & Office
- Advanced Email Security powered by Proofpoint
- Proofpoint MX records:
  - `mx1-us1.ppe-hosted.com`
  - `mx2-us1.ppe-hosted.com`

Current rule:

Do not change MX while exhausted or while on support call.

Support goal:

- restore Advanced Email Security / Proofpoint dashboard access
- inspect quarantine/message logs
- release/allow critical messages
- confirm routing/forwarding/aliasing so all mail lands at `gputnam@gputnammusic.com`

Critical senders/domains to allow:

- uspto.gov
- id.me
- twilio.com
- stripe.com
- github.com
- vercel.com
- godaddy.com
- microsoft.com

## DISCO → 4PE Strategy

DISCO is not permanent architecture.

DISCO is current paid reference/catalog/share/playback infrastructure.

4PE should eventually replace DISCO functions:

- audio upload
- audio playback
- share links
- embeds/share pages
- controlled downloads
- playlist/package grouping
- artwork
- lyrics/notes/metadata
- private/public access states
- catalog management

4PE must exceed DISCO by adding:

- PIX-PCK
- CC exact Copy-Capture mechanism
- II production/anchoring
- KK governance
- KK-Combo contiguous-only governance
- HUG/TUG delivery
- MC-BOT guided selection
- Admin promotion gates
- rights/ASCAP-aligned reporting support

## Sandman Current State

Sandman's Comin' now has:

- KK combo options
- selected first 3 combos
- audio locator worksheet
- async placement tooling

Important Sandman rule:

- no mK products in the PIX/KK lane
- valid products are PIX, KK, KK-Combo
- whoa sections may be connective material inside valid contiguous combos
- users cannot rearrange sections

## You Stop Talking Current State

You Stop Talking has selected PIX SSOT:

- `YOU STOP TALKING - 1988.wav`

DISCO reference exists.

Next work:

- build PIX-PCK
- section map
- contiguous KK-Combo candidates
- selected first 3–5 combos
- locator worksheet

## Immediate Revenue Plan

Sell now under controlled beta/manual fulfillment.

Primary offer:

I'm Sorry KUT HUG — $9

Customer path:

1. Customer chooses one apology KUT.
2. Customer pays.
3. GPM manually sends private playable link.
4. No download by default.
5. No custom remix.
6. No rearrangement.
7. Backend keeps lineage.

Secondary offer:

Forever & A Day Wedding Track Pack — reviewed package.

Customer path:

1. Customer buys reviewed wedding package.
2. GPM reviews selections.
3. GPM delivers approved private playable package/link.

## What Must Be Proven Next

### Checkout Preservation

For each sellable KUT:

- selected KUT ID is preserved
- Stripe/payment path works
- success/private link works
- customer receives correct playable asset

### Product Rows

Confirm product rows or launch rows for:

- apology
- birthday
- anniversary
- wedding

### Fulfillment

Document manual beta fulfillment:

- buyer name
- buyer email/phone
- selected KUT
- payment link/session
- private link sent
- delivery timestamp
- issue notes

## Daily Operating Plan

### Morning

1. Check email access / Proofpoint status.
2. Check Stripe dashboard for payments.
3. Check Git status.
4. Do not touch unrelated dirty files.
5. Verify one live product page.

### Midday

1. Sell / outreach for one offer only.
2. Focus on I'm Sorry KUT HUG first.
3. Track all buyers manually.
4. Fix only blocking issues.

### Afternoon

1. Prove checkout preservation.
2. Improve success/private link delivery.
3. Add Birthday or Anniversary only after apology works.

### Evening

1. Commit clean work.
2. Push.
3. Write one short status note.
4. Stop before exhaustion causes risky admin changes.

## Priority Stack

### Priority 1

Recover email / Proofpoint visibility.

Reason:
USPTO, ID.me, Stripe, Twilio, GoDaddy, GitHub, and Vercel all rely on email.

### Priority 2

Sell one controlled beta KUT.

Reason:
Cash pressure requires revenue path now.

### Priority 3

Prove checkout preservation.

Reason:
Turns beta/manual into repeatable sales.

### Priority 4

4PE replaces DISCO.

Reason:
Reduces cost and strengthens invention.

### Priority 5

Patent / legal packet.

Reason:
Protects 4PE/GPMx/KKr invention structure.

## Current Conclusion

K-KUT can sell KUTs now in controlled beta/manual fulfillment.

The first live revenue lane should be:

I'm Sorry KUT HUG.

The first higher-value package lane should be:

Forever & A Day Wedding Track Pack.

The system should not wait for perfect automation before testing sales.

But the public claim should remain honest:

private playable music moments, reviewed and fulfilled by G Putnam Music during beta.
