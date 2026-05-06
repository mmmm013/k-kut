# 4PE Release Checklist

## Core Release Rule

No production release should occur unless:

1. The change is approved for the intended user/process behavior.
2. The 4PE master gate passes.
3. The build passes.
4. The change does not violate product-control, voice-control, SMS, or display rules.

## Required Command

Run before production deployment:

node scripts/audit-4pe-master-gate.mjs

## Owner Approval Rule

No UI behavior change, system behavior change, voice routing change, product-flow change, checkout change, or display change may be released without explicit owner approval.

## Protected Rules

The release must preserve:

- MC-BOT leads non-Founder HUG/TUG flows.
- GP-BOT is reserved only for intentional Founder / Founder Quote clicks or links.
- HUGs and TUGs are private K-KUT links, not downloadable raw audio files.
- Full song downloads are allowed only when GPM intentionally sells a full-song download product.
- Mother’s Day HUG uses one section or one curated set at a time.
- Do not display all available KKs at once.
- Twilio SMS stays disabled until A2P 10DLC approval is verified.
- SMS consent must be voluntary, separate, and unchecked by default.
- Local capture inbox files must not be committed.

## Deployment Rule

If the master gate fails, do not deploy.

If the build fails, do not deploy.

If user experience behavior is unclear, stop and inspect before changing code.

## Rollback Rule

If production behavior breaks:

1. Stop new changes.
2. Identify the last known good commit.
3. Revert or redeploy the last known good state.
4. Add a rule or audit to prevent repeat failure.
5. Run the 4PE master gate before redeploying.

## DMAIC Control

Every defect should be handled through DMAIC:

- Define the failure.
- Measure where it occurred.
- Analyze why controls missed it.
- Improve the process with a rule, audit, or safer implementation.
- Control by adding the new check to the release gate where appropriate.
