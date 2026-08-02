# GPMx BIC HUG Revenue Pilot V001

Status: REVIEW BRANCH — PREVIEW AND PRODUCTION GATES REQUIRED

Authority: GD / Greg Putnam · BIC-Level · LL/BP

## Decision sequence

1. Finish the current 13HUGz reconciliation.
2. Establish one customer/music need glossary.
3. Re-digest and independently prove each selected music-to-need relationship.
4. Launch only a very small number of complete HUG revenue paths.

## Reconciliation result

The current `lib/hugzSeedCatalog.ts` contains exactly 13 HUGz Cards and 104 seed associations.

Current BIC result:

- current per-association PASS: **0**;
- `HOLD_CURRENT_THEME_FIT_REPROOF_REQUIRED`: **104**;
- deleted: **0**;
- audio changed: **0**;
- inventory changed: **0**;
- checkout changed by the reconciliation: **0**.

The newest complete 429 validation authority approved zero records for 13HUGz seeding and did not provide current per-II need-fit proof for these associations. The old associations are therefore held, not silently trusted and not deleted.

This association hold does not invalidate separately approved reusable IIs outside the held 429 packet.

## Shared need glossary

`data/matching/gpm-shared-need-glossary-v001.json` is the common matching language for both sides:

- exact customer words;
- relationship and point of view;
- what happened;
- desired effect;
- primary need;
- emotion, mood, sentiment, intensity, and time orientation;
- occasion;
- positive requirements;
- exclusions and contradictions.

One total-song or parent fit never auto-approves a child. Each KK, KOMBO, sK, or eligible mK requires independent evidence. Forced matching is prohibited. The fail-closed decision is exactly `NO THEME FIT — HOLD`.

## Corrected two-II pilot

The pilot contains exactly two separately approved reusable KK IIs:

1. **A LOVE LIKE THAT** — warmth/care, romantic devotion, and evidence-supported commitment or celebration directions.
2. **YOUR HEART POUNDIN'** — adult romantic physical spark only.

Each pilot record preserves:

- exact II ID;
- exact KK ID;
- Start TP and End TP values from the existing reusable-II registry;
- customer-delivery MP3 path;
- independent need-fit evidence and exclusions;
- existing publication approval;
- audio-proof PASS;
- payment authority;
- HUG package identity at $7.99.

The source and customer-delivery audio are reused without rebuilding or mutation.

## Don't Call It Love correction

The prior classification of **Don't Call It Love** as repair, apology, continued care, or reconnection was wrong.

GD's controlling song-level meaning is:

- lack of commitment;
- wanting sex;
- physical desire versus emotional commitment;
- resistance to calling the relationship love;
- possible mismatch in expectations, boundaries, and relationship labeling.

Earlier processing had already marked the shown timed candidates BAD and reported `NO REACHABLE KK FOUND FOR ROUTE: repair-still-love-you`. Later generated reusable-II and publication metadata improperly overrode that fail-closed result.

The correction now requires:

- public matching: **HOLD**;
- publication approval: **REVOKED**;
- payment approval: **REVOKED**;
- frontend appearance: **REMOVED**;
- public descriptive metadata and MGS: **REMOVED**;
- source and delivery audio: **PRESERVED, NOT MUTATED**;
- next process: **SONG → BLK → NBLK**.

The legacy 0–190 second candidate windows are not accepted as structural BLKs. Exact BLKs require authorized audio and lyric evidence, true structural labels, Start TP and End TP, independent meaning, point of view, relationship direction, desire-versus-commitment position, consent/boundary review, MGS, and contraindications.

Each NBLK must become a unique standalone II only when its meaning is complete. Public NBLK title, description, MGS, URL labeling, audio labeling, alt text, and checkout copy must not expose or inherit the parent track. Parent lineage remains ADMIN-only.

## Revenue-path controls

The customer route is `/hug-pilot`.

The page:

- displays exactly two evidence-controlled HUG choices;
- provides the existing customer-delivery audio for review;
- does not expose internal IDs to the customer;
- posts the exact hidden II ID and `offer=kk` to `/checkout`;
- contains no direct Stripe link;
- lets the governed checkout revalidate publication authority, public-storage/Twinkle evidence when available, package/family match, pending-order creation, origin domain, and exact-II retention.

Viewing or playing the page creates no order. Submitting checkout creates the governed pending-order record and redirects to the already authorized payment link. No paid test transaction is required for the build gate.

## Launch gate

Production launch requires all of the following:

- BIC reconciliation/glossary/pilot audit PASS;
- Don't Call It Love song→BLK→NBLK hold audit PASS;
- public sensory/MGS approved-source audit PASS;
- complete application Preview build PASS;
- external Preview fetch of `/hug-pilot` PASS;
- external fetch of both delivery-audio paths PASS;
- no direct-Stripe bypass in the pilot page;
- exact-II checkout source contract PASS;
- merge and Production deployment under GD's launch instruction;
- external Production fetch PASS.

The HUG/TUG/BUG database migration remains unapplied. This HUG-only pilot uses the existing `hug` pending-order state and does not require the held TUG/BUG migration.

## Non-claims

A successful build or route fetch is not a completed customer purchase. The launch report must distinguish:

- page and audio publicly reachable;
- governed checkout contract present;
- Production route live;
- actual paid order, payment, fulfillment, and recipient receipt not executed unless direct transaction evidence exists.
