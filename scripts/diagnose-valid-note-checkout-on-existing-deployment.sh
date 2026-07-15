#!/bin/zsh
set -euo pipefail

REPO="/Users/gputnammusicllc/GPM_LOCAL_REPOS/k-kut"
DEPLOY_URL="https://k-8yocuxue0-g-putnam-music.vercel.app"
OUT="/Users/gputnammusicllc/GPM_LOCAL_VAULT/09_Registry/RAPID_DEPLOYMENT_429_KK_SALES_GATE_V004_20260712-000531/07_BIC_2611_REGULAR_HUG_PRODUCTION_V001"
CATALOG="$OUT/24_DIAGNOSTIC_CATALOG.json"
HEADERS="$OUT/25_VALID_NOTE_DIAGNOSTIC_HEADERS.txt"
BODY="$OUT/26_VALID_NOTE_DIAGNOSTIC_BODY.txt"

stop() { print -u2 -- "STOP: $1"; exit 1; }
header() { awk -v h="$2" 'BEGIN{IGNORECASE=1} {n=$0;sub(/:.*/,"",n);if(tolower(n)==tolower(h)){sub(/^[^:]+:[[:space:]]*/,"");sub(/\r$/ ,"");print;exit}}' "$1"; }

cd "$REPO"
[[ -f .vercel/project.json ]] || stop "Vercel project link is missing"
mkdir -p "$OUT"

if command -v vercel >/dev/null 2>&1 && vercel curl --help >/dev/null 2>&1; then
  V=(vercel)
else
  V=(npx --yes vercel@latest)
fi

print -- "VALID-NOTE CHECKOUT DIAGNOSTIC"
print -- "EXISTING DEPLOYMENT: $DEPLOY_URL"
print -- "UPLOAD: NO"
print -- "BUILD: NO"
print -- "DOMAIN CHANGE: NO"
print -- "PAYMENT/CHARGE: NO"

"${V[@]}" curl /api/public-ii-catalog --deployment "$DEPLOY_URL" -- -fsSL --max-time 60 -o "$CATALOG"
II="$(python3 - "$CATALOG" <<'PY'
import json,sys
from pathlib import Path
p=json.loads(Path(sys.argv[1]).read_text())
r=p.get('records') or []
if p.get('inventoryCount') != 2611 or p.get('purchasableCount') != 2611 or not r:
    raise SystemExit(1)
print(r[0]['id'])
PY
)" || stop "catalog no longer proves 2611/2611"

set +e
"${V[@]}" curl /checkout --deployment "$DEPLOY_URL" -- -sS --max-time 60 -X POST -D "$HEADERS" -o "$BODY" \
  --data-urlencode "ii=$II" \
  --data-urlencode "offer=hug" \
  --data-urlencode "personal_note=BIC proof note"
CURL_STATUS=$?
set -e

HTTP_STATUS="$(awk 'toupper($1) ~ /^HTTP\// {code=$2} END {print code}' "$HEADERS")"
LOCATION="$(header "$HEADERS" location)"

print -- "SELECTED II: $II"
print -- "VERCEL CURL EXIT: $CURL_STATUS"
print -- "HTTP STATUS: ${HTTP_STATUS:-MISSING}"
print -- "LOCATION: ${LOCATION:-MISSING}"

case "$LOCATION" in
  https://checkout.stripe.com/*|https://buy.stripe.com/*)
    print -- "RESULT: STRIPE CHECKOUT REDIRECT PRESENT"
    ;;
  *checkout=personal-note-checkout-held*)
    print -- "RESULT: STRIPE SECRET NOT AVAILABLE TO PERSONALIZED CHECKOUT"
    ;;
  *checkout=regular-hug-price-authority-held*)
    print -- "RESULT: EXISTING REGULAR HUG PAYMENT LINK OR USD 7.99 PRICE AUTHORITY DID NOT VERIFY"
    ;;
  *checkout=stripe-session-url-missing*)
    print -- "RESULT: STRIPE SESSION CREATED WITHOUT A CHECKOUT URL"
    ;;
  *)
    print -- "RESULT: UNCLASSIFIED REDIRECT — SEE LOCATION ABOVE"
    ;;
esac

print -- "DIAGNOSTIC COMPLETE — NOTHING DEPLOYED OR CHARGED"
