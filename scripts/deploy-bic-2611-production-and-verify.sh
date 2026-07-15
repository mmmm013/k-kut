#!/bin/zsh
set -euo pipefail

REPO="/Users/gputnammusicllc/GPM_LOCAL_REPOS/k-kut"
SOURCE_COMMIT="ec560ac6fccd708af892fc69343cbc72212a71df"
SOURCE_PATH="scripts/deploy-bic-2611-production-and-verify.sh"
TEMP_SCRIPT="$REPO/.tmp/regular-hug-release-price-safe-$$.zsh"

stop() {
  print -u2 -- "STOP: $1"
  exit 1
}

cleanup() {
  rm -f "$TEMP_SCRIPT"
}
trap cleanup EXIT INT TERM HUP

cd "$REPO"
mkdir -p "$REPO/.tmp"
git cat-file -e "$SOURCE_COMMIT^{commit}" 2>/dev/null || stop "controlled release source commit is unavailable"

git show "$SOURCE_COMMIT:$SOURCE_PATH" \
  | sed \
      -e 's/PRICE: \$7\.99/PRICE: USD 7.99/g' \
      -e 's/Stripe-hosted \$7\.99/Stripe-hosted USD 7.99/g' \
      -e 's/HELD OFFERS: \$4\.99 \/ \$12\.99 \/ \$0\.99/HELD OFFERS: USD 4.99 \/ USD 12.99 \/ USD 0.99/g' \
      -e 's/AS \$7\.99 REGULAR HUGS/AS USD 7.99 REGULAR HUGS/g' \
  > "$TEMP_SCRIPT"

[[ -s "$TEMP_SCRIPT" ]] || stop "price-safe controlled runner was not created"

if grep -nE '\$[0-9]' "$TEMP_SCRIPT"; then
  stop "an unsafe dollar-number expression remains; no deployment started"
fi

zsh -n "$TEMP_SCRIPT" || stop "price-safe controlled runner failed syntax validation"

print -- "PRICE-SAFE RUNNER VALIDATED"
exec zsh "$TEMP_SCRIPT"
