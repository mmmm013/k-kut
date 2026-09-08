# Admin Surface Checklist

## When to use this

Use this checklist when adding, renaming, splitting, repairing, or reviewing any internal admin surface. It is intended to keep each admin tool on one canonical route with local ownership, clear compatibility boundaries, and a repeatable smoke-test path.

## Canonical route ownership

- [ ] Choose one canonical admin route for the surface.
- [ ] Keep the canonical route entry file and its primary local module in the same folder.
- [ ] Make the canonical route the only active implementation path.
- [ ] Keep access control, private metadata, and other route-local safeguards in place at the canonical entry point.

## Legacy compatibility boundary

- [ ] Keep old paths only if they are still needed for redirect or compatibility behavior.
- [ ] Do not leave active UI or business logic in a legacy route folder.
- [ ] Make legacy routes thin wrappers only: validate access if required, then redirect to the canonical route.
- [ ] Remove stale references that make a legacy path look like the active surface.

## Admin index and internal links

- [ ] Point the admin index and other internal navigation to the canonical route.
- [ ] Update internal docs, runbooks, and reviewer notes to use the canonical route.
- [ ] Keep legacy links only where backward compatibility is explicitly required.

## Wiring integrity

- [ ] Verify the canonical route imports its intended local module with no missing files.
- [ ] Verify route-local modules are owned beside the canonical route instead of in a legacy folder.
- [ ] Verify API calls, actions, and helpers used by the surface point to the intended canonical backend wiring.
- [ ] Verify there is no duplicate active implementation split across canonical and legacy paths.

## End-to-end flow smoke test

- [ ] Open the canonical route and confirm unauthorized access is blocked.
- [ ] Confirm the primary queue, list, or load step succeeds.
- [ ] Confirm required media or data for the active item loads.
- [ ] Confirm the main decision or save action succeeds.
- [ ] Re-open or refresh and confirm persisted state is reflected correctly.

## Persistence and safety

- [ ] Verify writes happen through the intended server-side path.
- [ ] Verify the surface updates only the records it is meant to govern.
- [ ] Verify guardrails, clamps, and state-transition rules still hold after the change.
- [ ] Verify the surface remains safe to revisit, refresh, or resume without corrupting state.

## Tests and audits

- [ ] Keep or add focused tests for route-adjacent logic and decision mapping where applicable.
- [ ] Keep or add at least one smoke test path for the canonical admin flow.
- [ ] Add or maintain audits that catch missing local imports, broken route wiring, or active code left in legacy folders.
- [ ] Re-run the targeted tests and audits touched by the change.

## Naming and maintainability

- [ ] Use the canonical surface name in routes, modules, links, and docs.
- [ ] Prefer simple local ownership over cross-folder route wiring.
- [ ] Keep compatibility boundaries explicit and easy to delete later.
- [ ] Avoid temporary names that can become permanent maintenance debt.

## Definition of done

- [ ] One canonical admin route exists and owns the active implementation locally.
- [ ] Any legacy path is redirect-only or compatibility-only.
- [ ] Admin index and internal references point to the canonical route.
- [ ] Route wiring is intact, smoke-tested, and free of missing local modules.
- [ ] Persistence, safety, tests, and audits have been checked before merge.

## Release gate

Use this release checklist when deciding whether a change is deploy-ready. Platform readiness is the hard gate; content coverage is a separate quality check.

### Platform readiness score (must pass: 8/8)

- [ ] Canonical route correct
- [ ] Local active module
- [ ] Legacy paths redirect-only
- [ ] Internal links/docs updated
- [ ] Token/private gates preserved
- [ ] Route wiring intact
- [ ] Smoke-tested end to end
- [ ] Persistence/safety intact

### Content coverage score (target: 6/7 or better)

- [ ] Core themes represented
- [ ] Top sentiment buckets covered
- [ ] Major user intents covered
- [ ] No obvious theme skew
- [ ] Messaging matches audience
- [ ] Seasonal/campaign themes included if needed
- [ ] Coverage gaps explicitly accepted if below target

### Decision rule

- **Deploy:** Platform readiness passes, and content coverage meets target or has explicit approval.
- **Block:** Any platform readiness item fails.
