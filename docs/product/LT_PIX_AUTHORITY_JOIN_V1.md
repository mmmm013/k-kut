# LT-PIX Authority Join V1

Status: **PROTOTYPE — READ ONLY**

This closes the inventory-classification failure without inventing authority.

## Core rule

Every vocal LT-PIX requires:

- immutable full-track audio identity and SHA-256;
- complete lyrics;
- sequential `INTRO` / `BLK1…BLKn` authority;
- exact InTP/VTP boundary pairs;
- preserved parent and derivative lineage.

Legacy labels such as verse, chorus, bridge, outro, `V1`, `Ch1`, and `Br` may remain as historical metadata, but they are not KUT cutting authority.

## Partitions

- `STAGE`: all authority is joined and internally consistent.
- `TRIAGE`: inputs are reachable but need correction, BLK reprosecution, or listening approval.
- `TRIAGE_SESSION_ACCESS_REQUIRED`: authority is outside the current session or has not been consolidated.
- `BLOCKED_MISSING_AUTHORITY`: permitted only when an exhaustive search has produced an explicit absence receipt.

The 429-row audio inventory must not be labeled `BLOCKED_MISSING_AUTHORITY` merely because Desktop or Mac-only inputs are inaccessible.

## Runner

```bash
node scripts/kkr/audit-lt-pix-authority-join-law-v1.mjs

node scripts/kkr/run-lt-pix-authority-join-read-only-v1.mjs \
  --inventory /path/to/01_LT_PIX_INPUT_AUTHORITY.csv \
  --lyrics /path/to/full-lt-pix-lyrics.json \
  --boundaries /path/to/blk-vtp-intp-authority.json \
  --out reports/lt-pix-authority-join/latest.json
```

The runner reads authority and writes only the requested report. It does not render or alter audio, write databases, delete files, or deploy.

## Thank You correction

Existing `Thank You` records using `V1a`, `Ch1`, `Br`, or other former song-section labels remain `TRIAGE` until the full-track SSOT is joined to complete lyrics and exact sequential BLK/VTP/InTP authority. A derived KK—including the Sample 2 keeper—cannot establish its own parent BLK identity.
