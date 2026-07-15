#!/bin/zsh
set -euo pipefail

REPO="/Users/gputnammusicllc/GPM_LOCAL_REPOS/k-kut"
EXPECTED_SHA="4c6e3ed7f168f8e4b3867dcd4be56df0f8bfbeab"
RELEASE_BRANCH="agent/map-2611-regular-hug-note"
WORKTREE="${TMPDIR:-/tmp}/k-kut-2611-regular-hug-$$"
BASE="/Users/gputnammusicllc/GPM_LOCAL_VAULT/09_Registry/RAPID_DEPLOYMENT_429_KK_SALES_GATE_V004_20260712-000531"
OUT="$BASE/07_BIC_2611_REGULAR_HUG_PRODUCTION_V001"
LOG="$OUT/00_PRODUCTION_DEPLOYMENT_LOG.txt"
SUMMARY="$OUT/01_BIC_2611_REGULAR_HUG_PROOF.txt"
ROOT_HTML="$OUT/02_ROOT_PAGE.html"
BROWSE_HTML="$OUT/03_BROWSE_PAGE.html"
FIND_HTML="$OUT/04_FIND_PAGE.html"
CATALOG_JSON="$OUT/05_PUBLIC_CATALOG_API.json"
WEBHOOK_JSON="$OUT/06_STRIPE_WEBHOOK_STATUS.json"
DIRECT_CHECKOUT_HEADERS="$OUT/07_DIRECT_CHECKOUT_HEADERS.txt"
AUDIO_PROOF="$OUT/08_PUBLIC_AUDIO_RANGE_PROOF.txt"
VALID_NOTE_HEADERS="$OUT/09_VALID_NOTE_CHECKOUT_HEADERS.txt"
INVALID_NOTE_HEADERS="$OUT/10_INVALID_NOTE_CHECKOUT_HEADERS.txt"
DOMAIN_CATALOG_JSON="$OUT/11_DOMAIN_PUBLIC_CATALOG_API.json"

stop() {
  print -u2 -- ""
  print -u2 -- "STOP: $1"
  exit 1
}

cleanup() {
  if [[ -d "$WORKTREE" ]]; then
    git -C "$REPO" worktree remove --force "$WORKTREE" >/dev/null 2>&1 || rm -rf "$WORKTREE"
  fi
}
trap cleanup EXIT INT TERM HUP

header_value() {
  local FILE="$1"
  local HEADER="$2"
  awk -v wanted="$HEADER" 'BEGIN{IGNORECASE=1} {
    name=$0
    sub(/:.*/, "", name)
    if (tolower(name)==tolower(wanted)) {
      sub(/^[^:]+:[[:space:]]*/, "")
      sub(/\r$/, "")
      print
      exit
    }
  }' "$FILE"
}

[[ -d "$REPO/.git" ]] || stop "K-KUT repository missing: $REPO"
mkdir -p "$OUT"
: > "$LOG"

cd "$REPO"
git fetch origin main "$RELEASE_BRANCH"
REMOTE_MAIN="$(git rev-parse origin/main)"
[[ "$REMOTE_MAIN" == "$EXPECTED_SHA" ]] || stop "origin/main is $REMOTE_MAIN; expected controlled product commit $EXPECTED_SHA"
[[ -f "$REPO/.vercel/project.json" ]] || stop "Vercel project link is missing from $REPO/.vercel/project.json"

git worktree add --detach "$WORKTREE" "$EXPECTED_SHA" >/dev/null
cp -R "$REPO/.vercel" "$WORKTREE/.vercel"
cd "$WORKTREE"

print -- "GPMx / K-KUT 2611 REGULAR HUG PRODUCTION RELEASE"
print -- "================================================="
print -- "CONTROLLED COMMIT: $EXPECTED_SHA"
print -- "PUBLIC PRODUCT: K-KUT HUG"
print -- "PRICE: $7.99"
print -- "OPTIONAL PERSONAL NOTE: 13 WORDS"
print -- "CURRENT WORKING TREE CHANGED: NO"
print -- "SOURCE AUDIO CHANGED: NO"
print -- "STRIPE LINKS CHANGED: NO"
print -- "CHARITABLE SALES CLAIMS ADDED: NO"
print -- ""

node scripts/audit-2611-bic-storefront.mjs
node scripts/audit-one-regular-hug-payment-process.mjs
node scripts/audit-approved-stripe-links.mjs
node scripts/preflight-deploy-size.mjs

if command -v vercel >/dev/null 2>&1; then
  VERCEL_COMMAND=(vercel)
else
  VERCEL_COMMAND=(npx --yes vercel@latest)
fi

set +e
"${VERCEL_COMMAND[@]}" deploy --prod --skip-domain --yes --archive=tgz 2>&1 | tee "$LOG"
DEPLOY_STATUS=${pipestatus[1]}
set -e
[[ "$DEPLOY_STATUS" -eq 0 ]] || stop "Vercel production-settings deployment failed; live domains were not changed"

DEPLOY_URL="$(grep -Eo 'https://[A-Za-z0-9._-]+\.vercel\.app' "$LOG" | tail -n 1)"
[[ -n "$DEPLOY_URL" ]] || stop "Vercel deployment passed but its .vercel.app URL could not be resolved from the log"

print -- "ISOLATED DEPLOYMENT URL: $DEPLOY_URL"
print -- "LIVE DOMAINS CHANGED BEFORE PROOF: NO"

READY=0
for ATTEMPT in {1..18}; do
  set +e
  curl -fsSL --max-time 30 "$DEPLOY_URL/" -o "$ROOT_HTML"
  ROOT_STATUS=$?
  curl -fsSL --max-time 30 "$DEPLOY_URL/browse" -o "$BROWSE_HTML"
  BROWSE_STATUS=$?
  curl -fsSL --max-time 30 "$DEPLOY_URL/find" -o "$FIND_HTML"
  FIND_STATUS=$?
  curl -fsSL --max-time 60 "$DEPLOY_URL/api/public-ii-catalog" -o "$CATALOG_JSON"
  CATALOG_STATUS=$?
  set -e

  if [[ "$ROOT_STATUS" -eq 0 && "$BROWSE_STATUS" -eq 0 && "$FIND_STATUS" -eq 0 && "$CATALOG_STATUS" -eq 0 ]] \
    && grep -q "Browse All K-KUTs" "$ROOT_HTML" \
    && grep -q "Browse All K-KUTs" "$BROWSE_HTML" \
    && grep -q "13 words" "$BROWSE_HTML" \
    && grep -q "MC-BOT music guide" "$FIND_HTML"; then
    READY=1
    break
  fi

  print -- "Waiting for isolated deployment... attempt $ATTEMPT/18"
  sleep 5
done

[[ "$READY" -eq 1 ]] || stop "isolated deployment did not expose Browse All, MC-BOT, and the 13-word HUG promise"

CATALOG_PROOF="$(python3 - "$CATALOG_JSON" "$OUT/12_AUDIO_URLS.txt" <<'PY'
import json
import sys
from pathlib import Path

catalog_path = Path(sys.argv[1])
audio_path = Path(sys.argv[2])
payload = json.loads(catalog_path.read_text(encoding="utf-8"))

if payload.get("ok") is not True:
    raise SystemExit("catalog API did not return ok=true")
if payload.get("status") != "BIC_PUBLIC_CATALOG_READY":
    raise SystemExit("catalog API status is not BIC_PUBLIC_CATALOG_READY")
if payload.get("inventoryCount") != 2611:
    raise SystemExit(f"catalog inventoryCount={payload.get('inventoryCount')} expected 2611")
if payload.get("purchasableCount") != 2611:
    raise SystemExit(f"catalog purchasableCount={payload.get('purchasableCount')} expected 2611")

mapping = payload.get("productMapping") or {}
if mapping.get("publicProduct") != "K-KUT HUG":
    raise SystemExit("catalog public product is not K-KUT HUG")
if mapping.get("priceUsd") != 7.99:
    raise SystemExit("catalog price is not 7.99")
if mapping.get("checkoutOffer") != "hug":
    raise SystemExit("catalog checkout offer is not hug")
if mapping.get("personalNoteWordLimit") != 13:
    raise SystemExit("catalog personal-note limit is not 13")
if set(mapping.get("heldOffers") or []) != {"4.99", "12.99", "0.99", "charity_sales_claims"}:
    raise SystemExit("deferred offers or charitable sales claims are not held")

records = payload.get("records")
if not isinstance(records, list) or len(records) != 2611:
    raise SystemExit(f"catalog records={len(records) if isinstance(records, list) else 'invalid'} expected 2611")

approved_prefix = "https://vwlzubxshjjonabpeagd.supabase.co/storage/v1/object/public/ii-delivery/release-gate-v004/"
for index, row in enumerate(records, 1):
    if row.get("offer") != "K-KUT HUG":
        raise SystemExit(f"record {index} offer is not K-KUT HUG")
    if row.get("priceUsd") != 7.99:
        raise SystemExit(f"record {index} price is not 7.99")
    if row.get("checkout") != "hug":
        raise SystemExit(f"record {index} checkout is not hug")
    if row.get("personalNoteWordLimit") != 13:
        raise SystemExit(f"record {index} note limit is not 13")
    if not row.get("checkoutHref"):
        raise SystemExit(f"record {index} has no checkoutHref")
    if not str(row.get("audioUrl", "")).startswith(approved_prefix):
        raise SystemExit(f"unapproved audio URL for {row.get('id')}")

indexes = [0, len(records) // 2, len(records) - 1]
audio_path.write_text(
    "\n".join(records[index]["audioUrl"] for index in indexes) + "\n",
    encoding="utf-8",
)

selected = records[0]
print("\t".join([str(len(records)), str(payload["purchasableCount"]), selected["id"], selected["checkoutHref"]]))
PY
)" || stop "public catalog API failed the all-2,611 Regular HUG product proof"

IFS=$'\t' read -r INVENTORY_COUNT PURCHASABLE_COUNT SELECTED_ID CHECKOUT_HREF <<< "$CATALOG_PROOF"
[[ "$INVENTORY_COUNT" == "2611" ]] || stop "public catalog count proof failed"
[[ "$PURCHASABLE_COUNT" == "2611" ]] || stop "all-2,611 checkout-ready proof failed"
[[ -n "$SELECTED_ID" && -n "$CHECKOUT_HREF" ]] || stop "no exact checkout-ready K-KUT could be selected"

: > "$AUDIO_PROOF"
while IFS= read -r AUDIO_URL; do
  [[ -n "$AUDIO_URL" ]] || continue
  AUDIO_CODE="$(curl -sS --max-time 30 -H 'Range: bytes=0-0' -o /dev/null -w '%{http_code}' "$AUDIO_URL")"
  if [[ "$AUDIO_CODE" != "200" && "$AUDIO_CODE" != "206" ]]; then
    stop "public audio range proof returned HTTP $AUDIO_CODE for $AUDIO_URL"
  fi
  print -- "$AUDIO_CODE $AUDIO_URL" >> "$AUDIO_PROOF"
done < "$OUT/12_AUDIO_URLS.txt"

curl -sS --max-time 30 -D "$DIRECT_CHECKOUT_HEADERS" -o /dev/null \
  "$DEPLOY_URL${CHECKOUT_HREF}"
DIRECT_LOCATION="$(header_value "$DIRECT_CHECKOUT_HEADERS" location)"
[[ "$DIRECT_LOCATION" == https://buy.stripe.com/* ]] || stop "no-note K-KUT HUG did not use the approved Regular HUG payment link"
[[ "$DIRECT_LOCATION" == *"client_reference_id=$SELECTED_ID"* ]] || stop "no-note checkout did not preserve selected K-KUT ID $SELECTED_ID"

FOURTEEN_WORDS="one two three four five six seven eight nine ten eleven twelve thirteen fourteen"
curl -sS --max-time 30 -D "$INVALID_NOTE_HEADERS" -o /dev/null -X POST \
  --data-urlencode "ii=$SELECTED_ID" \
  --data-urlencode "offer=hug" \
  --data-urlencode "personal_note=$FOURTEEN_WORDS" \
  "$DEPLOY_URL/checkout"
INVALID_NOTE_LOCATION="$(header_value "$INVALID_NOTE_HEADERS" location)"
[[ "$INVALID_NOTE_LOCATION" == *"checkout=personal-note-over-13-words"* ]] || stop "14-word personal note was not blocked"

curl -sS --max-time 45 -D "$VALID_NOTE_HEADERS" -o /dev/null -X POST \
  --data-urlencode "ii=$SELECTED_ID" \
  --data-urlencode "offer=hug" \
  --data-urlencode "personal_note=BIC proof note" \
  "$DEPLOY_URL/checkout"
VALID_NOTE_LOCATION="$(header_value "$VALID_NOTE_HEADERS" location)"
[[ "$VALID_NOTE_LOCATION" == https://checkout.stripe.com/* ]] || stop "valid personal note did not create a Stripe-hosted $7.99 HUG checkout session"

curl -fsSL --max-time 30 "$DEPLOY_URL/api/stripe/webhook" -o "$WEBHOOK_JSON"
python3 - "$WEBHOOK_JSON" <<'PY' || stop "Stripe webhook production status is not BIC-ready"
import json
import sys
from pathlib import Path

payload = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
if payload.get("ok") is not True:
    raise SystemExit("webhook route did not return ok=true")
if payload.get("status") != "configured":
    raise SystemExit(f"webhook status={payload.get('status')} expected configured")
if payload.get("exact_ii_capture") != "client_reference_id_to_selected_hug_id":
    raise SystemExit("webhook exact-II capture proof missing")
if payload.get("personal_note_capture") != "optional_13_words_before_hug_content":
    raise SystemExit("webhook personal-note capture proof missing")
if payload.get("durable_order_authority") != "stripe_checkout_session":
    raise SystemExit("Stripe Checkout is not the durable order authority")
if payload.get("production_fulfillment_mode") != "manual_review_from_stripe_order":
    raise SystemExit("production fulfillment is not manual-reviewed from Stripe")
if payload.get("local_packet_mode") != "disabled_on_read_only_runtime":
    raise SystemExit("Vercel local packet writes are not disabled")
PY

print -- "All isolated proofs passed. Binding production domains..."
"${VERCEL_COMMAND[@]}" alias set "$DEPLOY_URL" www.k-kut.com
"${VERCEL_COMMAND[@]}" alias set "$DEPLOY_URL" k-kut.com

DOMAIN_READY=0
for ATTEMPT in {1..18}; do
  set +e
  curl -fsSL --max-time 60 "https://www.k-kut.com/api/public-ii-catalog" -o "$DOMAIN_CATALOG_JSON"
  DOMAIN_STATUS=$?
  set -e

  if [[ "$DOMAIN_STATUS" -eq 0 ]] && python3 - "$DOMAIN_CATALOG_JSON" <<'PY'
import json
import sys
from pathlib import Path
payload = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
raise SystemExit(0 if payload.get("inventoryCount") == 2611 and payload.get("purchasableCount") == 2611 else 1)
PY
  then
    DOMAIN_READY=1
    break
  fi

  print -- "Waiting for K-KUT production aliases... attempt $ATTEMPT/18"
  sleep 5
done

[[ "$DOMAIN_READY" -eq 1 ]] || stop "domains were assigned but www.k-kut.com did not prove 2,611/2,611 checkout-ready records"

cat > "$SUMMARY" <<EOF
GPMx / K-KUT 2611 REGULAR HUG PRODUCTION PROOF
================================================
CONTROLLED COMMIT: $EXPECTED_SHA
VERCEL DEPLOYMENT: $DEPLOY_URL
DOMAIN: https://www.k-kut.com
PUBLIC PRODUCT: K-KUT HUG
PRICE: $7.99
PUBLIC CATALOG RECORDS: $INVENTORY_COUNT
CHECKOUT-READY RECORDS: $PURCHASABLE_COUNT
OPTIONAL PERSONAL NOTE: 13 WORDS MAXIMUM
PERSONAL NOTE PLACEMENT: BEFORE HUG CONTENT
14-WORD NOTE BLOCK: PASS
VALID NOTE STRIPE SESSION: PASS
DIRECT NO-NOTE CHECKOUT: APPROVED REGULAR HUG LINK
EXACT CHECKOUT TEST II: $SELECTED_ID
STRIPE CLIENT REFERENCE PRESERVED: PASS
STRIPE WEBHOOK CONFIGURED: PASS
STRIPE DURABLE ORDER AUTHORITY: PASS
VERCEL LOCAL PACKET WRITE: DISABLED
MANUAL-REVIEW FULFILLMENT MODE: PASS
HELD OFFERS: $4.99 / $12.99 / $0.99
CHARITABLE SALES CLAIMS: HELD
PUBLIC AUDIO RANGE SAMPLES: 3/3 PASS
SOURCE AUDIO CHANGED: 0
AUDIO REBUILT: 0
STRIPE LINKS CHANGED: 0
PUBLIC MP3 OBJECTS CHANGED: 0
ROLLBACK COMMIT: 083e322c9efa447120ae0a9c8b81fd5cd91847cb
PASS: ALL 2611 K-KUTS ARE LIVE AS $7.99 REGULAR HUGS WITH OPTIONAL 13-WORD NOTES
EOF

print -- ""
cat "$SUMMARY"
