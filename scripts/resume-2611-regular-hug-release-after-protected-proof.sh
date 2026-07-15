#!/bin/zsh
set -euo pipefail

REPO="/Users/gputnammusicllc/GPM_LOCAL_REPOS/k-kut"
DEPLOY_URL="https://k-8yocuxue0-g-putnam-music.vercel.app"
BASE="/Users/gputnammusicllc/GPM_LOCAL_VAULT/09_Registry/RAPID_DEPLOYMENT_429_KK_SALES_GATE_V004_20260712-000531"
OUT="$BASE/07_BIC_2611_REGULAR_HUG_PRODUCTION_V001"
ROOT_HTML="$OUT/13_PROTECTED_ROOT_PAGE.html"
BROWSE_HTML="$OUT/14_PROTECTED_BROWSE_PAGE.html"
FIND_HTML="$OUT/15_PROTECTED_FIND_PAGE.html"
CATALOG_JSON="$OUT/16_PROTECTED_CATALOG.json"
AUDIO_URLS="$OUT/17_PROTECTED_AUDIO_URLS.txt"
DIRECT_HEADERS="$OUT/18_PROTECTED_DIRECT_CHECKOUT_HEADERS.txt"
INVALID_HEADERS="$OUT/19_PROTECTED_INVALID_NOTE_HEADERS.txt"
VALID_HEADERS="$OUT/20_PROTECTED_VALID_NOTE_HEADERS.txt"
WEBHOOK_JSON="$OUT/21_PROTECTED_WEBHOOK.json"
DOMAIN_JSON="$OUT/22_LIVE_DOMAIN_CATALOG.json"
SUMMARY="$OUT/23_BIC_2611_REGULAR_HUG_FINAL_PROOF.txt"

stop() { print -u2 -- "STOP: $1"; exit 1; }
header() { awk -v h="$2" 'BEGIN{IGNORECASE=1} {n=$0;sub(/:.*/,"",n);if(tolower(n)==tolower(h)){sub(/^[^:]+:[[:space:]]*/,"");sub(/\r$/,"");print;exit}}' "$1"; }

cd "$REPO"
[[ -f .vercel/project.json ]] || stop "Vercel project link is missing"
mkdir -p "$OUT"

if command -v vercel >/dev/null 2>&1 && vercel curl --help >/dev/null 2>&1; then
  V=(vercel)
else
  V=(npx --yes vercel@latest)
fi

print -- "RESUMING EXISTING VERIFIED BUILD"
print -- "DEPLOYMENT: $DEPLOY_URL"
print -- "SECOND UPLOAD: NO"
print -- "SECOND BUILD: NO"
print -- "LIVE DOMAINS CHANGED BEFORE PROOF: NO"

pget() { "${V[@]}" curl "$1" --deployment "$DEPLOY_URL" -- -fsSL --max-time 60 -o "$2"; }
pheaders() { "${V[@]}" curl "$1" --deployment "$DEPLOY_URL" -- -sS --max-time 60 -D "$2" -o /dev/null; }

pget / "$ROOT_HTML"
pget /browse "$BROWSE_HTML"
pget /find "$FIND_HTML"
pget /api/public-ii-catalog "$CATALOG_JSON"

grep -q "Browse All K-KUTs" "$ROOT_HTML" || stop "protected root did not open Browse All"
grep -q "Browse All K-KUTs" "$BROWSE_HTML" || stop "protected browse page proof failed"
grep -q "13 words" "$BROWSE_HTML" || stop "protected 13-word promise proof failed"
grep -q "MC-BOT music guide" "$FIND_HTML" || stop "protected MC-BOT page proof failed"

PROOF="$(python3 - "$CATALOG_JSON" "$AUDIO_URLS" <<'PY'
import json, sys
from pathlib import Path
p=json.loads(Path(sys.argv[1]).read_text())
assert p.get('ok') is True
assert p.get('status')=='BIC_PUBLIC_CATALOG_READY'
assert p.get('inventoryCount')==2611
assert p.get('purchasableCount')==2611
m=p.get('productMapping') or {}
assert m.get('publicProduct')=='K-KUT HUG'
assert m.get('priceUsd')==7.99
assert m.get('checkoutOffer')=='hug'
assert m.get('personalNoteWordLimit')==13
assert set(m.get('heldOffers') or [])=={'4.99','12.99','0.99','charity_sales_claims'}
r=p.get('records')
assert isinstance(r,list) and len(r)==2611
prefix='https://vwlzubxshjjonabpeagd.supabase.co/storage/v1/object/public/ii-delivery/release-gate-v004/'
for row in r:
    assert row.get('offer')=='K-KUT HUG'
    assert row.get('priceUsd')==7.99
    assert row.get('checkout')=='hug'
    assert row.get('personalNoteWordLimit')==13
    assert row.get('checkoutHref')
    assert str(row.get('audioUrl','')).startswith(prefix)
Path(sys.argv[2]).write_text('\n'.join(r[i]['audioUrl'] for i in (0,len(r)//2,len(r)-1))+'\n')
print(r[0]['id']+'\t'+r[0]['checkoutHref'])
PY
)" || stop "catalog did not prove all 2611 Regular HUG mappings"
IFS=$'\t' read -r II CHECKOUT <<< "$PROOF"

while IFS= read -r URL; do
  CODE="$(curl -sS --max-time 30 -H 'Range: bytes=0-0' -o /dev/null -w '%{http_code}' "$URL")"
  [[ "$CODE" == 200 || "$CODE" == 206 ]] || stop "public audio proof failed with HTTP $CODE"
done < "$AUDIO_URLS"

pheaders "$CHECKOUT" "$DIRECT_HEADERS"
DIRECT_LOCATION="$(header "$DIRECT_HEADERS" location)"
[[ "$DIRECT_LOCATION" == https://buy.stripe.com/* ]] || stop "no-note checkout did not use approved Regular HUG Stripe link"
[[ "$DIRECT_LOCATION" == *"client_reference_id=$II"* ]] || stop "no-note checkout lost exact K-KUT ID"

"${V[@]}" curl /checkout --deployment "$DEPLOY_URL" -- -sS --max-time 60 -X POST -D "$INVALID_HEADERS" -o /dev/null \
  --data-urlencode "ii=$II" --data-urlencode "offer=hug" \
  --data-urlencode "personal_note=one two three four five six seven eight nine ten eleven twelve thirteen fourteen"
[[ "$(header "$INVALID_HEADERS" location)" == *"checkout=personal-note-over-13-words"* ]] || stop "14-word note was not blocked"

"${V[@]}" curl /checkout --deployment "$DEPLOY_URL" -- -sS --max-time 60 -X POST -D "$VALID_HEADERS" -o /dev/null \
  --data-urlencode "ii=$II" --data-urlencode "offer=hug" --data-urlencode "personal_note=BIC proof note"
[[ "$(header "$VALID_HEADERS" location)" == https://checkout.stripe.com/* ]] || stop "valid note did not create unpaid Stripe checkout session"

pget /api/stripe/webhook "$WEBHOOK_JSON"
python3 - "$WEBHOOK_JSON" <<'PY' || stop "Stripe webhook proof failed"
import json,sys
from pathlib import Path
p=json.loads(Path(sys.argv[1]).read_text())
assert p.get('ok') is True and p.get('status')=='configured'
assert p.get('exact_ii_capture')=='client_reference_id_to_selected_hug_id'
assert p.get('personal_note_capture')=='optional_13_words_before_hug_content'
assert p.get('durable_order_authority')=='stripe_checkout_session'
assert p.get('production_fulfillment_mode')=='manual_review_from_stripe_order'
assert p.get('local_packet_mode')=='disabled_on_read_only_runtime'
PY

print -- "ALL PROTECTED-DEPLOYMENT PROOFS PASSED"
print -- "Binding production domains now..."
"${V[@]}" alias set "$DEPLOY_URL" www.k-kut.com
"${V[@]}" alias set "$DEPLOY_URL" k-kut.com

READY=0
for N in {1..18}; do
  if curl -fsSL --max-time 60 "https://www.k-kut.com/api/public-ii-catalog" -o "$DOMAIN_JSON" && \
     python3 - "$DOMAIN_JSON" <<'PY'
import json,sys
from pathlib import Path
p=json.loads(Path(sys.argv[1]).read_text())
raise SystemExit(0 if p.get('inventoryCount')==2611 and p.get('purchasableCount')==2611 else 1)
PY
  then READY=1; break; fi
  print -- "Waiting for live domain proof... $N/18"
  sleep 5
done
[[ "$READY" == 1 ]] || stop "live domain did not prove 2611/2611 checkout-ready records"

cat > "$SUMMARY" <<EOF
K-KUT 2611 REGULAR HUG FINAL PROOF
DEPLOYMENT: $DEPLOY_URL
PUBLIC PRODUCT: K-KUT HUG
PRICE: USD 7.99
CATALOG RECORDS: 2611
CHECKOUT-READY RECORDS: 2611
OPTIONAL NOTE: 13 WORDS MAXIMUM
14-WORD NOTE BLOCK: PASS
VALID NOTE STRIPE SESSION: PASS
EXACT K-KUT ID PRESERVED: PASS
PUBLIC AUDIO SAMPLES: 3/3 PASS
STRIPE WEBHOOK: PASS
HELD OFFERS: USD 4.99 / USD 12.99 / USD 0.99
CHARITABLE SALES CLAIMS: HELD
SOURCE AUDIO CHANGED: 0
AUDIO REBUILT: 0
PASS: ALL 2611 K-KUTS ARE LIVE AS USD 7.99 REGULAR HUGS WITH OPTIONAL 13-WORD NOTES
EOF
cat "$SUMMARY"
