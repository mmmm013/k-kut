# GPMx Product Audio Release Gate Checklist

This checklist applies to active product-bound II, CI, KK, K-KOMBO, DP, and Dispatch audio assets.

## Premade residence rule

GPMx products are not invented on request.

When a user requests an II, CI, KK, K-KOMBO, HUG, DP, or Dispatch item, the product candidate should already exist in a premade / resident inventory state.

The request does not create the invention. The request selects, routes, packages, and releases an already-existing inventoried item.

Required path:

1. Premade resident inventory
2. User/request selection
3. DP packaging
4. Release Gate
5. Dispatch / delivery / sale

## Required before release

- [ ] Product candidate already exists in premade / resident inventory state.
- [ ] Product audio is not raw/source/master audio.
- [ ] Product audio is not review/proof/staging/_work/TPR audio.
- [ ] Product audio is not a naked review cut unless explicitly marked as founder/admin exception.
- [ ] Product audio has one canonical GPMx Twinkle attached at the art-tail end.
- [ ] Product audio metadata includes `canonicalTwinkleId: "gpmx-canonical-twinkle"`.
- [ ] Product audio metadata includes `twinkleRequired: true`.
- [ ] Product audio metadata includes `twinkleApplied: true`.
- [ ] Product audio metadata includes `twinkleAttachPoint: "artTailEnd"`.
- [ ] DP/Dispatch records do not reference naked review/source/proof audio.
- [ ] Active product manifest passes `scripts/audit-gpmx-product-twinkle-art-tail.mjs`.

## Protected lanes

Raw/source/master audio remains clean and unforced.

Internal review proof, naked KK review, BLK lab, source-audit, TPR, and candidate lanes may remain naked for judgment unless the specific test is a Twinkle test.

## Release meaning

Release Gate does not invent the product.

Release Gate verifies that the premade resident product is safe, properly packaged, properly Twinkle-adorned, properly documented, and ready for Dispatch.
