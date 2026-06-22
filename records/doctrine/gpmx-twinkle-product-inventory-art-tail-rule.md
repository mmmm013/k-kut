# GPMx Twinkle Product Inventory / Art-Tail Rule

There is one canonical GPMx Twinkle.

Twinkle is not selected from a menu. Twinkle is not a variable sound effect. Twinkle is the required GPMx product inventory priming and art-tail adornment convention.

## Core rule

When an II, CI, KK, K-KOMBO, DP, or Dispatch audio file becomes inventoried as a product-bound GPMx asset, the one canonical Twinkle attaches at the art-tail end.

## Required metadata

Every active product-bound audio record must carry:

- `canonicalTwinkleId: "gpmx-canonical-twinkle"`
- `twinkleRequired: true`
- `twinkleApplied: true`
- `twinkleAttachPoint: "artTailEnd"`

Recommended companion metadata:

- `canonicalTwinkleSource`
- `twinkleApplicationGain`
- `twinkleRole: "GPMx product inventory priming / art-tail adornment"`

## Protected lanes

Raw/source/master audio remains clean and unforced.

Internal review proof, naked KK review, TPR, BLK lab, source-audit, and candidate lanes may remain naked for judgment unless the specific test is a Twinkle test.

## Product boundary

No active public product-bound II, CI, KK, K-KOMBO, DP, or Dispatch audio may leave GPMx naked unless explicitly marked as a founder/admin exception.

DP/Dispatch records must not reference naked review audio, `_work` files, staging audio, proof audio, raw source audio, or source-audio paths as final customer/product audio.
