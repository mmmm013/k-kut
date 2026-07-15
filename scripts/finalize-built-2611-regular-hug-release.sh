#!/bin/zsh
set -euo pipefail

REPO="/Users/gputnammusicllc/GPM_LOCAL_REPOS/k-kut"
EXPECTED_SHA="8e77812908690858b384ce9988573fb95aa84e70"
DEPLOYMENT_ID="9gS9Xx1d3wTyxXNHCDc6EXnHvkWR"
APPROVED_HUG_URL="https://buy.stripe.com/fZu8wOawC4wicy8fbU4ow0y"
BASE="/Users/gputnammusicllc/GPM_LOCAL_VAULT/09_Registry/RAPID_DEPLOYMENT_429_KK_SALES_GATE_V004_20260712-000531"
OUT="$BASE/07_BIC_2611_REGULAR_HUG_PRODUCTION_V001"
INSPECT_LOG="$OUT/24_FINAL_BUILT_DEPLOYMENT_INSPECT.txt"
ROOT_HTML="$OUT/25_FINAL_PROTECTED_ROOT.html"
BROWSE_HTML="$OUT/26_FINAL_PROTECTED_BROWSE.html"
FIND_HTML="$OUT/27_FINAL_PROTECTED_FIND.html"
CATALOG_JSON="$OUT/28_FINAL_PROTECTED_CATALOG.json"
WEBHOOK_JSON="$OUT/29_FINAL_PROTECTED_WEBHOOK.json"
AUDIO_URLS="$OUT/30_FINAL_AUDIO_URLS.txt"
DIRECT_HEADERS="$OUT/31_FINAL_DIRECT_CHECKOUT_HEADERS.txt"
INVALID_HEADERS="$OUT/32_FINAL_INVALID_NOTE_HEADERS.txt"
VALID_HEADERS="$OUT/33_FINAL_VALID_NOTE_HEADERS.txt"
LIVE_CATALOG_JSON="$OUT/34_FINAL_LIVE_CATALOG.json"
LIVE_ROOT_HTML="$OUT/35_FINAL_LIVE_ROOT.html"
LIVE_VALID_HEADERS="$OUT/36_FINAL_LIVE_VALID_NOTE_HEADERS.txt"
SUMMARY="$OUT/37_BIC_2611_REGULAR_HUG_LIVE_PROOF.txt"

stop() {
  print -u2 -- ""
  print -u2 -- "STOP: $1"
  exit 1
}

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
cd "$REPO"
mkdir -p "$OUT"

git fetch origin main
REMOTE_MAIN="$(git rev-parse origin/main)"
[[ "$REMOTE_MAIN" == "$EXPECTED_SHA" ]] || stop "origin/main is $REMOTE_MAIN; expected $EXPECTED_SHA"
[[ -f .vercel/project.json ]] || stop "Vercel project link is missing"

if command -v vercel >/dev/null 2>&1; then
  V=(vercel)
else
  V=(npx --yes vercel@latest)
fi

print -- "FINALIZING ALREADY-BUILT K-KUT RELEASE"
print -- "CONTROLLED COMMIT: $EXPECTED_SHA"
print -- "VERCEL DEPLOYMENT ID: $DEPLOYMENT_ID"
print -- "UPLOAD: NO"
print -- "BUILD: NO"
print -- "LIVE DOMAIN CHANGE BEFORE PROOF: NO"
print -- "PAYMENT OR CHARGE: NO"
print -- "PUBLIC PRODUCT: K-KUT HUG"
print -- "PRICE: USD 7.99"
print -- "OPTIONAL NOTE: 13 WORDS"
print -- ""

"${V[@]}" inspect "$DEPLOYMENT_ID" --wait --no-color 2>&1 | tee "$INSPECT_LOG"
DEPLOY_URL="$(grep -Eo 'https://[A-Za-z0-9._-]+\.vercel\.app' "$INSPECT_LOG" | head -n 1)"
[[ -n "$DEPLOY_URL" ]] || stop "could not resolve the already-built deployment URL"

print -- "BUILT DEPLOYMENT URL: $DEPLOY_URL"

pget() {
  "${V[@]}" curl "$1" --deployment "$DEPLOYMENT_ID" -- -fsSL --max-time 90 -o "$2"
}

pheaders() {
  "${V[@]}" curl "$1" --deployment "$DEPLOYMENT_ID" -- -sS --max-time 90 -D "$2" -o /dev/null
}

pget / "$ROOT_HTML"
pget /browse "$BROWSE_HTML"
pget /find "$FIND_HTML"
pget /api/public-ii-catalog "$CATALOG_JSON"
pget /api/stripe/webhook "$WEBHOOK_JSON"

grep -q "Browse All K-KUTs" "$ROOT_HTML" || stop "protected root did not open Browse All"
grep -q "Browse All K-KUTs" "$BROWSE_HTML" || stop "protected Browse All page proof failed"
grep -q "13 words" "$BROWSE_HTML" || stop "protected 13-word promise proof failed"
grep -q "MC-BOT music guide" "$FIND_HTML" || stop "protected MC-BOT page proof failed"

PROOF="$(python3 - "$CATALOG_JSON" "$AUDIO_URLS" <<'PY'
import json
import sys
from pathlib import Path

payload = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
if payload.get("ok") is not True:
    raise SystemExit("catalog ok flag failed")
if payload.get("status") != "BIC_PUBLIC_CATALOG_READY":
    raise SystemExit("catalog status failed")
if payload.get("inventoryCount") != 2611:
    raise SystemExit("catalog inventory count failed")
if payload.get("purchasableCount") != 2611:
    raise SystemExit("catalog purchasable count failed")

mapping = payload.get("productMapping") or {}
if mapping.get("publicProduct") != "K-KUT HUG":
    raise SystemExit("public product mapping failed")
if mapping.get("priceUsd") != 7.99:
    raise SystemExit("public price mapping failed")
if mapping.get("checkoutOffer") != "hug":
    raise SystemExit("checkout offer mapping failed")
if mapping.get("personalNoteWordLimit") != 13:
    raise SystemExit("personal note limit failed")
if set(mapping.get("heldOffers") or []) != {"4.99", "12.99", "0.99", "charity_sales_claims"}:
    raise SystemExit("held offer mapping failed")

records = payload.get("records")
if not isinstance(records, list) or len(records) != 2611:
    raise SystemExit("catalog record count failed")

prefix = "https://vwlzubxshjjonabpeagd.supabase.co/storage/v1/object/public/ii-delivery/release-gate-v004/"
for index, row in enumerate(records, 1):
    if row.get("offer") != "K-KUT HUG":
        raise SystemExit(f"record {index} offer failed")
    if row.get("priceUsd") != 7.99:
        raise SystemExit(f"record {index} price failed")
    if row.get("checkout") != "hug":
        raise SystemExit(f"record {index} checkout failed")
    if row.get("personalNoteWordLimit") != 13:
        raise SystemExit(f"record {index} note limit failed")
    if not row.get("checkoutHref"):
        raise SystemExit(f"record {index} checkout href failed")
    if not str(row.get("audioUrl", "")).startswith(prefix):
        raise SystemExit(f"record {index} audio URL failed")

for index in (0, len(records) // 2, len(records) - 1):
    pass
Path(sys.argv[2]).write_text(
    "\n".join(records[index]["audioUrl"] for index in (0, len(records) // 2, len(records) - 1)) + "\n",
    encoding="utf-8",
)
selected = records[0]
print(selected["id"] + "\t" + selected["checkoutHref"])
PY
)" || stop "protected catalog did not prove 2,611/2,611 Regular HUG mappings"

IFS=$'\t' read -r SELECTED_ID CHECKOUT_HREF <<< "$PROOF"
[[ -n "$SELECTED_ID" && -n "$CHECKOUT_HREF" ]] || stop "catalog did not provide an exact checkout selection"

while IFS= read -r AUDIO_URL; do
  [[ -n "$AUDIO_URL" ]] || continue
  CODE="$(curl -sS --max-time 30 -H 'Range: bytes=0-0' -o /dev/null -w '%{http_code}' "$AUDIO_URL")"
  [[ "$CODE" == "200" || "$CODE" == "206" ]] || stop "public audio proof failed with HTTP $CODE"
done < "$AUDIO_URLS"

pheaders "$CHECKOUT_HREF" "$DIRECT_HEADERS"
DIRECT_LOCATION="$(header_value "$DIRECT_HEADERS" location)"
python3 - "$DIRECT_LOCATION" "$APPROVED_HUG_URL" "$SELECTED_ID" <<'PY' || stop "no-note checkout did not preserve the approved link and exact II"
import sys
from urllib.parse import parse_qs, urlparse
location, approved, selected = sys.argv[1:]
parsed = urlparse(location)
base = f"{parsed.scheme}://{parsed.netloc}{parsed.path}"
reference = (parse_qs(parsed.query).get("client_reference_id") or [""])[0]
raise SystemExit(0 if base == approved and reference == selected else 1)
PY

"${V[@]}" curl /checkout --deployment "$DEPLOYMENT_ID" -- -sS --max-time 90 -X POST -D "$INVALID_HEADERS" -o /dev/null \
  --data-urlencode "ii=$SELECTED_ID" \
  --data-urlencode "offer=hug" \
  --data-urlencode "personal_note=one two three four five six seven eight nine ten eleven twelve thirteen fourteen"
INVALID_LOCATION="$(header_value "$INVALID_HEADERS" location)"
[[ "$INVALID_LOCATION" == *"checkout=personal-note-over-13-words"* ]] || stop "14-word note was not blocked"

VALID_NOTE="BIC proof note"
"${V[@]}" curl /checkout --deployment "$DEPLOYMENT_ID" -- -sS --max-time 90 -X POST -D "$VALID_HEADERS" -o /dev/null \
  --data-urlencode "ii=$SELECTED_ID" \
  --data-urlencode "offer=hug" \
  --data-urlencode "personal_note=$VALID_NOTE"
VALID_LOCATION="$(header_value "$VALID_HEADERS" location)"
python3 - "$VALID_LOCATION" "$APPROVED_HUG_URL" "$SELECTED_ID" "$VALID_NOTE" <<'PY' || stop "valid note did not preserve the approved link, exact II, and note"
import sys
from urllib.parse import parse_qs, urlparse
location, approved, selected, note = sys.argv[1:]
parsed = urlparse(location)
base = f"{parsed.scheme}://{parsed.netloc}{parsed.path}"
reference = (parse_qs(parsed.query).get("client_reference_id") or [""])[0]
expected = f"H1|{selected}|{note}"
raise SystemExit(0 if base == approved and reference == expected and len(reference) <= 200 else 1)
PY

python3 - "$WEBHOOK_JSON" <<'PY' || stop "protected Stripe webhook status proof failed"
import json
import sys
from pathlib import Path
payload = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
assert payload.get("ok") is True
assert payload.get("status") == "configured"
assert payload.get("exact_ii_capture") == "client_reference_id_to_selected_hug_id"
assert payload.get("personal_note_capture") == "optional_13_words_before_hug_content"
assert payload.get("client_reference_format") == "H1|inventory_id|personal_note"
assert payload.get("durable_order_authority") == "stripe_checkout_session"
assert payload.get("production_fulfillment_mode") == "manual_review_from_stripe_order"
assert payload.get("local_packet_mode") == "disabled_on_read_only_runtime"
PY

print -- "ALL ALREADY-BUILT DEPLOYMENT PROOFS PASSED"
print -- "Binding K-KUT domains now..."
"${V[@]}" alias set "$DEPLOY_URL" www.k-kut.com
"${V[@]}" alias set "$DEPLOY_URL" k-kut.com

LIVE_READY=0
for ATTEMPT in {1..18}; do
  set +e
  curl -fsSL --max-time 90 "https://www.k-kut.com/" -o "$LIVE_ROOT_HTML"
  ROOT_STATUS=$?
  curl -fsSL --max-time 90 "https://www.k-kut.com/api/public-ii-catalog" -o "$LIVE_CATALOG_JSON"
  CATALOG_STATUS=$?
  set -e

  if [[ "$ROOT_STATUS" -eq 0 && "$CATALOG_STATUS" -eq 0 ]] \
    && grep -q "Browse All K-KUTs" "$LIVE_ROOT_HTML" \
    && python3 - "$LIVE_CATALOG_JSON" <<'PY'
import json
import sys
from pathlib import Path
payload = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
raise SystemExit(0 if payload.get("inventoryCount") == 2611 and payload.get("purchasableCount") == 2611 else 1)
PY
  then
    LIVE_READY=1
    break
  fi

  print -- "Waiting for live K-KUT domain proof... $ATTEMPT/18"
  sleep 5
done

[[ "$LIVE_READY" -eq 1 ]] || stop "live domain did not prove Browse All and 2,611/2,611 checkout-ready records"

curl -sS --max-time 60 -X POST -D "$LIVE_VALID_HEADERS" -o /dev/null \
  --data-urlencode "ii=$SELECTED_ID" \
  --data-urlencode "offer=hug" \
  --data-urlencode "personal_note=$VALID_NOTE" \
  "https://www.k-kut.com/checkout"
LIVE_VALID_LOCATION="$(header_value "$LIVE_VALID_HEADERS" location)"
python3 - "$LIVE_VALID_LOCATION" "$APPROVED_HUG_URL" "$SELECTED_ID" "$VALID_NOTE" <<'PY' || stop "live note checkout proof failed"
import sys
from urllib.parse import parse_qs, urlparse
location, approved, selected, note = sys.argv[1:]
parsed = urlparse(location)
base = f"{parsed.scheme}://{parsed.netloc}{parsed.path}"
reference = (parse_qs(parsed.query).get("client_reference_id") or [""])[0]
raise SystemExit(0 if base == approved and reference == f"H1|{selected}|{note}" else 1)
PY

cat > "$SUMMARY" <<EOF
K-KUT 2611 REGULAR HUG LIVE PROOF
==================================
CONTROLLED COMMIT: $EXPECTED_SHA
VERCEL DEPLOYMENT ID: $DEPLOYMENT_ID
VERCEL DEPLOYMENT URL: $DEPLOY_URL
DOMAIN: https://www.k-kut.com
PUBLIC PRODUCT: K-KUT HUG
PRICE: USD 7.99
CATALOG RECORDS: 2611
CHECKOUT-READY RECORDS: 2611
OPTIONAL NOTE: 13 WORDS MAXIMUM
14-WORD NOTE BLOCK: PASS
VALID NOTE APPROVED PAYMENT LINK: PASS
EXACT K-KUT ID PRESERVED: PASS
EXACT PERSONAL NOTE PRESERVED: PASS
CLIENT REFERENCE LIMIT: 200 CHARACTERS
PUBLIC AUDIO SAMPLES: 3/3 PASS
STRIPE WEBHOOK STATUS: PASS
HELD OFFERS: USD 4.99 / USD 12.99 / USD 0.99
CHARITABLE SALES CLAIMS: HELD
SOURCE AUDIO CHANGED: 0
AUDIO REBUILT: 0
NEW STRIPE PRODUCT: 0
NEW STRIPE PRICE: 0
NEW STRIPE PAYMENT LINK: 0
UPLOAD DURING FINALIZATION: 0
BUILD DURING FINALIZATION: 0
PASS: ALL 2611 K-KUTS ARE LIVE AS USD 7.99 REGULAR HUGS WITH OPTIONAL 13-WORD NOTES
EOF

print -- ""
cat "$SUMMARY"
