#!/bin/zsh
set -euo pipefail

REPO="/Users/gputnammusicllc/GPM_LOCAL_REPOS/k-kut"
EXPECTED_SHA="dbc3642ae4c158546fc7e0942c827e4a19fb49c6"
WORKTREE="${TMPDIR:-/tmp}/k-kut-bic-2611-production-$$"
BASE="/Users/gputnammusicllc/GPM_LOCAL_VAULT/09_Registry/RAPID_DEPLOYMENT_429_KK_SALES_GATE_V004_20260712-000531"
OUT="$BASE/06_BIC_2611_STOREFRONT_PRODUCTION_V001"
LOG="$OUT/00_PRODUCTION_DEPLOYMENT_LOG.txt"
SUMMARY="$OUT/01_BIC_2611_PRODUCTION_PROOF.txt"
ROOT_HTML="$OUT/02_ROOT_PAGE.html"
BROWSE_HTML="$OUT/03_BROWSE_PAGE.html"
FIND_HTML="$OUT/04_FIND_PAGE.html"
CATALOG_JSON="$OUT/05_PUBLIC_CATALOG_API.json"
WEBHOOK_JSON="$OUT/06_STRIPE_WEBHOOK_STATUS.json"
CHECKOUT_HEADERS="$OUT/07_EXACT_II_CHECKOUT_HEADERS.txt"
AUDIO_PROOF="$OUT/08_PUBLIC_AUDIO_RANGE_PROOF.txt"

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

[[ -d "$REPO/.git" ]] || stop "K-KUT repository missing: $REPO"
mkdir -p "$OUT"
: > "$LOG"

cd "$REPO"
git fetch origin main agent/bic-2611-browse-buy
REMOTE_MAIN="$(git rev-parse origin/main)"
[[ "$REMOTE_MAIN" == "$EXPECTED_SHA" ]] || stop "origin/main is $REMOTE_MAIN; expected controlled BIC commit $EXPECTED_SHA"
[[ -f "$REPO/.vercel/project.json" ]] || stop "Vercel project link is missing from $REPO/.vercel/project.json"

git worktree add --detach "$WORKTREE" "$EXPECTED_SHA" >/dev/null
cp -R "$REPO/.vercel" "$WORKTREE/.vercel"
cd "$WORKTREE"

print -- "GPMx / K-KUT BIC 2611 PRODUCTION RELEASE"
print -- "=========================================="
print -- "CONTROLLED COMMIT: $EXPECTED_SHA"
print -- "CURRENT WORKING TREE CHANGED: NO"
print -- "SOURCE AUDIO CHANGED: NO"
print -- "PRICING CHANGED: NO"
print -- "STRIPE LINKS CHANGED: NO"
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
"${VERCEL_COMMAND[@]}" deploy --prod --yes --archive=tgz 2>&1 | tee "$LOG"
DEPLOY_STATUS=${pipestatus[1]}
set -e
[[ "$DEPLOY_STATUS" -eq 0 ]] || stop "Vercel production deployment failed; live aliases were not changed by this script"

DEPLOY_URL="$(grep -Eo 'https://[A-Za-z0-9._-]+\.vercel\.app' "$LOG" | tail -n 1)"
[[ -n "$DEPLOY_URL" ]] || stop "Vercel deployment passed but its .vercel.app URL could not be resolved from the log"

print -- "DEPLOYMENT URL: $DEPLOY_URL"
print -- "Binding production domains..."
"${VERCEL_COMMAND[@]}" alias set "$DEPLOY_URL" www.k-kut.com
"${VERCEL_COMMAND[@]}" alias set "$DEPLOY_URL" k-kut.com

READY=0
for ATTEMPT in {1..18}; do
  set +e
  curl -fsSL --max-time 30 "https://www.k-kut.com/" -o "$ROOT_HTML"
  ROOT_STATUS=$?
  curl -fsSL --max-time 30 "https://www.k-kut.com/browse" -o "$BROWSE_HTML"
  BROWSE_STATUS=$?
  curl -fsSL --max-time 30 "https://www.k-kut.com/find" -o "$FIND_HTML"
  FIND_STATUS=$?
  curl -fsSL --max-time 60 "https://www.k-kut.com/api/public-ii-catalog" -o "$CATALOG_JSON"
  CATALOG_STATUS=$?
  set -e

  if [[ "$ROOT_STATUS" -eq 0 && "$BROWSE_STATUS" -eq 0 && "$FIND_STATUS" -eq 0 && "$CATALOG_STATUS" -eq 0 ]] \
    && grep -q "Browse All K-KUTs" "$ROOT_HTML" \
    && grep -q "Browse All K-KUTs" "$BROWSE_HTML" \
    && grep -q "MC-BOT music guide" "$FIND_HTML"; then
    READY=1
    break
  fi

  print -- "Waiting for K-KUT production alias... attempt $ATTEMPT/18"
  sleep 5
done

[[ "$READY" -eq 1 ]] || stop "www.k-kut.com did not expose Browse All and MC-BOT within the verification window"

CATALOG_PROOF="$(python3 - "$CATALOG_JSON" "$OUT/09_AUDIO_URLS.txt" <<'PY'
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

records = payload.get("records")
if not isinstance(records, list) or len(records) != 2611:
    raise SystemExit(f"catalog records={len(records) if isinstance(records, list) else 'invalid'} expected 2611")

purchasable = [row for row in records if row.get("checkoutHref")]
if not purchasable:
    raise SystemExit("catalog has zero checkout-ready K-KUTs")

for row in records:
    if not str(row.get("audioUrl", "")).startswith(
        "https://vwlzubxshjjonabpeagd.supabase.co/storage/v1/object/public/ii-delivery/release-gate-v004/"
    ):
        raise SystemExit(f"unapproved audio URL for {row.get('id')}")

indexes = [0, len(records) // 2, len(records) - 1]
audio_path.write_text(
    "\n".join(records[index]["audioUrl"] for index in indexes) + "\n",
    encoding="utf-8",
)

selected = purchasable[0]
print(
    "\t".join(
        [
            str(payload["inventoryCount"]),
            str(payload.get("purchasableCount", len(purchasable))),
            selected["id"],
            selected["checkoutHref"],
        ]
    )
)
PY
)" || stop "public catalog API failed its 2,611-record BIC proof"

IFS=$'\t' read -r INVENTORY_COUNT PURCHASABLE_COUNT SELECTED_ID CHECKOUT_HREF <<< "$CATALOG_PROOF"
[[ "$INVENTORY_COUNT" == "2611" ]] || stop "public catalog count proof failed"
[[ -n "$SELECTED_ID" && -n "$CHECKOUT_HREF" ]] || stop "no exact checkout-ready K-KUT could be selected"

: > "$AUDIO_PROOF"
while IFS= read -r AUDIO_URL; do
  [[ -n "$AUDIO_URL" ]] || continue
  AUDIO_CODE="$(curl -sS --max-time 30 -H 'Range: bytes=0-0' -o /dev/null -w '%{http_code}' "$AUDIO_URL")"
  if [[ "$AUDIO_CODE" != "200" && "$AUDIO_CODE" != "206" ]]; then
    stop "public audio range proof returned HTTP $AUDIO_CODE for $AUDIO_URL"
  fi
  print -- "$AUDIO_CODE $AUDIO_URL" >> "$AUDIO_PROOF"
done < "$OUT/09_AUDIO_URLS.txt"

curl -sS --max-time 30 -D "$CHECKOUT_HEADERS" -o /dev/null \
  "https://www.k-kut.com${CHECKOUT_HREF}"

CHECKOUT_LOCATION="$(awk 'BEGIN{IGNORECASE=1} /^location:/ {sub(/^[^:]+:[[:space:]]*/, ""); sub(/\r$/, ""); print; exit}' "$CHECKOUT_HEADERS")"
[[ "$CHECKOUT_LOCATION" == https://buy.stripe.com/* ]] || stop "exact K-KUT checkout did not redirect to an approved Stripe host"
[[ "$CHECKOUT_LOCATION" == *"client_reference_id=$SELECTED_ID"* ]] || stop "Stripe redirect did not preserve selected K-KUT ID $SELECTED_ID"

curl -fsSL --max-time 30 "https://www.k-kut.com/api/stripe/webhook" -o "$WEBHOOK_JSON"
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
if payload.get("durable_order_authority") != "stripe_checkout_session":
    raise SystemExit("Stripe Checkout is not the durable order authority")
if payload.get("production_fulfillment_mode") != "manual_review_from_stripe_order":
    raise SystemExit("production fulfillment is not manual-reviewed from Stripe")
if payload.get("local_packet_mode") != "disabled_on_read_only_runtime":
    raise SystemExit("Vercel local packet writes are not disabled")
PY

cat > "$SUMMARY" <<EOF
GPMx / K-KUT BIC 2611 STOREFRONT PRODUCTION PROOF
===================================================
CONTROLLED COMMIT: $EXPECTED_SHA
VERCEL DEPLOYMENT: $DEPLOY_URL
DOMAIN: https://www.k-kut.com
ROOT OPENS BROWSE ALL: PASS
BROWSE PAGE: PASS
MC-BOT FIND PAGE: PASS
PUBLIC CATALOG STATUS: BIC_PUBLIC_CATALOG_READY
PUBLIC CATALOG RECORDS: $INVENTORY_COUNT
CHECKOUT-READY RECORDS: $PURCHASABLE_COUNT
PUBLIC AUDIO RANGE SAMPLES: 3/3 PASS
EXACT CHECKOUT TEST II: $SELECTED_ID
STRIPE CLIENT REFERENCE PRESERVED: PASS
STRIPE WEBHOOK CONFIGURED: PASS
STRIPE DURABLE ORDER AUTHORITY: PASS
VERCEL LOCAL PACKET WRITE: DISABLED
MANUAL-REVIEW FULFILLMENT MODE: PASS
SOURCE AUDIO CHANGED: 0
AUDIO REBUILT: 0
PRICING CHANGED: 0
STRIPE LINKS CHANGED: 0
PUBLIC MP3 OBJECTS CHANGED: 0
ROLLBACK COMMIT: 8cc02750c650daa9c989381bc0aeebfae870a125
PASS: K-KUT 2611 STOREFRONT IS LIVE AND BIC-CONTROLLED
EOF

print -- ""
cat "$SUMMARY"
