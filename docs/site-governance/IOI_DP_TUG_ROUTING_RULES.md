# K-KUT IOI / DP / TUG Routing Rules

## Purpose

This rule file controls how K-KUT interprets a buyer request and routes it into the right HUG path.

Public buyer experience:

> Tell us what you want them to feel.
> We help prepare the right HUG path.

Internal routing:

- IOI identifies the emotional intent.
- DP chooses the delivery path or decision path.
- TUG is added only when useful language, guidance, interpretation, or utility is needed.
- Romance levels are controlled source lanes, not public complexity.

## Public Language Rule

Do not expose these internal terms on public buyer pages:

- IOI
- DP
- TUG
- routing logic
- source lane
- scoring
- romance level
- internal classification

Use public language such as:

- feeling
- moment
- message
- recipient
- occasion
- delivery time
- private HUG link
- help me say it

## IOI Rule

IOI means the buyer’s intent, interest, or emotional request.

Examples:

- thank you
- I love you
- I miss you
- I am sorry
- happy birthday
- proud of you
- respect
- grief or memory
- wedding love
- family warmth
- holiday gratitude
- romantic repair
- private intimate love

Every HUG request should resolve to at least one IOI before fulfillment.

## DP Rule

DP means the delivery path, decision path, or delivery point selected for the IOI.

Examples:

- standard private HUG link
- scheduled HUG delivery
- manual review required
- buyer handles delivery
- email manual delivery
- phone/manual review
- holiday archive path
- campaign collection path
- personal HUG path
- romance HUG path

A DP must never bypass manual review when review is required.

## TUG Rule

TUG means useful guidance around the HUG.

Add TUG when the buyer needs:

- help wording the message
- help choosing the closest feeling
- help softening a hard message
- help with apology or repair
- help with grief or memory
- help timing the delivery
- help choosing between romance levels
- help turning a vague request into a clear HUG path

Do not add TUG when the buyer already has a clear, simple HUG request.

## Romance Level Rule

Romance is not one flat lane.

Internal romance levels may include:

- gentle affection
- new love
- committed love
- longtime love
- missing you
- repair or apology
- desire or passion
- anniversary
- wedding or vow-level
- private intimate message

Public romance language should use simple labels:

- Love
- Missing You
- Anniversary
- Wedding
- I’m Sorry
- Still With Me
- Private Love
- For My Person

Do not expose numeric romance levels publicly.

## Timed Delivery Connection

Timed HUG Delivery is a DP.

When timing matters, the IOI should route to a scheduled delivery DP.

Timed delivery must remain manual-reviewed until production storage, alerting, timezone handling, compliance, and fallback are complete.

## Fulfillment Record Recommendation

Future fulfillment records should be able to hold:

- ioi_primary
- ioi_secondary
- dp_selected
- tug_required
- tug_reason
- romance_level_internal
- delivery_status
- manual_review_required
- requested_delivery_at
- requested_delivery_timezone

## Hard Rules

No automatic delivery without review unless explicitly approved later.

No public exposure of internal routing terms.

No placeholder audio.

No external audio.

No missing source proof.

No SMS automation until SMS/A2P compliance is complete.

No download unless explicitly allowed.

Private HUG link remains the default controlled delivery object.

## Public Promise

Approved public direction:

> Tell us what you want them to feel.
> We help prepare the right HUG path.
> You can also choose when the HUG should arrive.
