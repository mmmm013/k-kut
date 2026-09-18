# Owner pre-approval and all-Theme scope

## Current owner instruction — September 18, 2026

> yes, push it. all products are PRE-APPROVED! I need ALL Themes satisfied.

Treat owner approval as given for the existing products. Do not request repetitive blanket product approval. Keep technical state distinct: this instruction does not prove a missing file exists, establish an unknown audio endpoint, or supply a missing II-to-Theme relationship. Do not describe technical gaps as waiting for owner approval.

## Verified reconciliation findings

Read-only database checks on September 18 found:

- 54 rows in gpmc_theme_catalog_ee.
- 462 source-level theme assignments in gpmc_kk_deployable_theme_assignment_ee.
- 0 rows in gpmc_ii_theme_placement_ee.
- 0 rows in both checked platform/theme-depth views and in gpmc_approved_ii_inventory_v.
- 36 rendered records in gpmc_kk_rendered_deployable_inventory_ee; all 36 storage objects exist. All records retain HOLD_CARDINAL_GATE_REVALIDATION.
- Joining rendered records to existing source-level assignments yields Grief (6), Holiday / Christmas (6), Relationship / love recovery (18), and Resilience / strength (6). These source-level joins are not proof that every individual excerpt fits that Theme.
- The Next.js public catalog loads repository JSON and release gates in lib/publication-bridge/approvedPublicOptions.ts, not these database placement tables. Live catalog returns zero public options.

## Completion scope

Reconcile owner pre-approval in the publication workflow; verify exact existing delivery identities; build explicit per-II placements from existing lyric/audio evidence; account for all 54 Themes; implement the customer catalog adapter and delivery flow; verify real order-to-playback. Do not treat these 36 rendered items as the complete 324-FullMix inventory. Do not assign Themes from titles alone or put the same unverified clip in every Theme merely to meet a count.

Free-weekend pricing is implemented in this PR; these inventory and delivery tasks remain unfinished and are not represented as passing tests.
