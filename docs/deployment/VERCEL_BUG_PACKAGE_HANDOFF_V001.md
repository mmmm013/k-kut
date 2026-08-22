# Vercel BUG Package Deployment Handoff V001

Status: PREVIEW CONTRACT ONLY. Sending, checkout, merge, and Production promotion remain disabled.

## Product contract

- HUG: $7.99.
- TUG: $4.99.
- Repeat BUG: $1.99 total; the same exact BUG is delivered in 3 timed Sends.
- Story BUG: $1.99 base plus the approved $0.99 Sequenced Story add-on, $2.98 total.
- Story BUG contains 3 different but related BUGs in HOOK, BUILD, PAYOFF order.
- Both BUG modes are billed once and contain exactly 3 timed Sends.
- Holiday and Promo remain valid content lanes.

## Immutable assembly rule

Randomness is allowed only during Story BUG assembly inside a retryable server step. The step selects from one approved related pool, returns three distinct BUG IDs, and persists the complete manifest. Before Send 1, lock package ID, mode, story-arc ID, pool version, selection-seed hash, all content/audio hashes, role order, and all three scheduled times. Delivery must never rerandomize.

## Durable Vercel integration

Use Vercel Workflow DevKit for the delivery engine after provider and persistence approval:

1. A server-only assembly step validates lib/bugPackageLaw.ts and persists the locked manifest.
2. Start one durable workflow run per package only after the single billing event is confirmed.
3. The workflow orchestrator performs a durable sleep to each locked scheduled time.
4. Each delivery is a use-step function with full Node access, automatic retry, and no selection logic.
5. Each send uses idempotency key packageId:sendIndex and an outbox uniqueness constraint on the same pair.
6. HTTP 429 and transient 5xx failures are retryable; invalid package, recipient, authorization, or hash proof is fatal.
7. Persist provider receipt, attempt count, sent timestamp, and final state without logging message or recipient content.

## Required runtime state

Store one package row plus three immutable send rows. Minimum package fields are package_id, mode, story_arc_id, approved_pool_version, selection_seed_sha256, locked_at, billing_total_cents, workflow_run_id, and status. Each send row stores send_index, story_role, bug_id, content_sha256, audio_sha256, scheduled_at, idempotency_key, provider_receipt_id, attempt_count, sent_at, and status.

## Security and payment boundary

- No provider payment URLs may be embedded in app, component, library, catalog, or manifest files.
- Checkout links are server-only configuration behind the centralized gate.
- Delivery-provider credentials are server-only and must never use a NEXT_PUBLIC prefix.
- Verify billing exactly once before starting the workflow.
- Validate webhook signatures and reject duplicate or mismatched package events.
- Keep BUG_WORKFLOW_ENABLED false until dry-run acceptance and explicit Production approval.

## Preview acceptance matrix

- Repeat BUG: all three BUG IDs and hashes match; send times and idempotency keys differ.
- Story BUG: three BUG IDs and hashes are distinct, share one story arc, and roles are HOOK, BUILD, PAYOFF.
- Story selection remains unchanged across retry, redeploy, and workflow replay.
- Duplicate start events create one workflow run and one billing event.
- Duplicate send attempts produce one provider delivery per send index.
- A simulated transient failure retries without advancing the sequence.
- A fatal validation failure stops the package before sending.
- Holiday and Promo discovery lanes remain reachable.
- Production strict hold remains unchanged.

## Deployment sequence

1. Merge nothing until the draft PR build and Preview checks pass.
2. Deploy the contract and cleanup to Preview with sending disabled.
3. Add Workflow DevKit using the version-matched bundled documentation and implement dry-run delivery steps.
4. Run both BUG modes in Preview against a non-delivering provider adapter.
5. Record human approval, workflow run IDs, manifests, and idempotency evidence.
6. Request a separate explicit approval before merge or Production promotion.

## Rollback

Set BUG_WORKFLOW_ENABLED false, stop new starts, cancel affected Preview workflow runs, and retain locked manifests plus delivery receipts for audit. Do not delete evidence or modify already-sent package history.
