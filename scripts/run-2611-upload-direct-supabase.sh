#!/bin/zsh
set -euo pipefail

REPO="/Users/gputnammusicllc/GPM_LOCAL_REPOS/k-kut"
BASE="/Users/gputnammusicllc/GPM_LOCAL_VAULT/09_Registry/RAPID_DEPLOYMENT_429_KK_SALES_GATE_V004_20260712-000531"
OUT="$BASE/05_PUBLIC_SUPABASE_II_DEPLOYMENT_V001"
REMOTE_REF="origin/agent/deploy-2611-public-ii-inventory"
SOURCE_SCRIPT="$REPO/.tmp/gpmx-upload-source-2611-$$.sh"
NODE_SCRIPT="$REPO/.tmp/gpmx-upload-direct-2611-$$.mjs"
KEY_ERROR="$OUT/04_SUPABASE_CLI_KEY_ERROR.txt"
PROJECT_REF="vwlzubxshjjonabpeagd"
SUPABASE_URL="https://vwlzubxshjjonabpeagd.supabase.co"

cleanup() {
  unset SERVER_KEY KEYS_JSON
  rm -f "$SOURCE_SCRIPT" "$NODE_SCRIPT"
}
trap cleanup EXIT INT TERM HUP

cd "$REPO"
mkdir -p "$OUT" "$REPO/.tmp"

if ! git show "$REMOTE_REF:scripts/deploy-2611-public-ii-inventory.sh" > "$SOURCE_SCRIPT"; then
  echo "STOP: could not read the controlled 2611 uploader from $REMOTE_REF"
  exit 1
fi

python3 - "$SOURCE_SCRIPT" "$NODE_SCRIPT" <<'PY'
from pathlib import Path
import sys

source = Path(sys.argv[1]).read_text(encoding="utf-8")
start_marker = 'cat > "$NODE_SCRIPT" <<\'NODE\'\n'
end_marker = "\nNODE\n"

if start_marker not in source:
    raise SystemExit("STOP: controlled uploader body start marker not found")

body = source.split(start_marker, 1)[1]

if end_marker not in body:
    raise SystemExit("STOP: controlled uploader body end marker not found")

Path(sys.argv[2]).write_text(body.split(end_marker, 1)[0] + "\n", encoding="utf-8")
PY

if command -v supabase >/dev/null 2>&1; then
  SUPABASE_COMMAND=(supabase)
else
  SUPABASE_COMMAND=(npx --yes supabase@latest)
fi

rm -f "$KEY_ERROR"
set +e
KEYS_JSON="$(
  "${SUPABASE_COMMAND[@]}" projects api-keys \
    --project-ref "$PROJECT_REF" \
    --reveal \
    --output json \
    2>"$KEY_ERROR"
)"
KEY_STATUS=$?
set -e

if [[ "$KEY_STATUS" -ne 0 ]]; then
  echo "STOP: Supabase CLI could not retrieve the project server key."
  if [[ -s "$KEY_ERROR" ]]; then
    tail -n 8 "$KEY_ERROR"
  fi
  exit "$KEY_STATUS"
fi

SERVER_KEY="$(print -r -- "$KEYS_JSON" | node -e '
const fs = require("fs");
const text = fs.readFileSync(0, "utf8");
let data;
try {
  data = JSON.parse(text);
} catch {
  process.exit(2);
}
const strings = [];
function walk(value) {
  if (typeof value === "string") {
    strings.push(value.trim());
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) walk(item);
    return;
  }
  if (value && typeof value === "object") {
    for (const item of Object.values(value)) walk(item);
  }
}
function jwtRole(value) {
  const parts = value.split(".");
  if (parts.length !== 3) return "";
  try {
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
    return String(payload.role || "");
  } catch {
    return "";
  }
}
walk(data);
const modern = strings.find((value) => value.startsWith("sb_secret_"));
const legacy = strings.find((value) => jwtRole(value) === "service_role");
process.stdout.write(modern || legacy || "");
')"
unset KEYS_JSON

if [[ -z "$SERVER_KEY" ]]; then
  echo "STOP: Supabase CLI returned no usable secret/service-role key."
  exit 1
fi

printf '%s\n' "GPMx 2611 DIRECT SUPABASE UPLOAD"
printf '%s\n' "================================"
printf '%s\n' "PROJECT: $PROJECT_REF"
printf '%s\n' "SERVER KEY RETRIEVED: YES"
printf '%s\n' "SECRET VALUE PRINTED: NO"
printf '\n'

set +e
env \
  -u SUPABASE_SECRET_KEY \
  -u SUPABASE_SERVICE_KEY \
  NEXT_PUBLIC_SUPABASE_URL="$SUPABASE_URL" \
  SUPABASE_URL="$SUPABASE_URL" \
  SUPABASE_SERVICE_ROLE_KEY="$SERVER_KEY" \
  node "$NODE_SCRIPT" \
  2>&1 | tee "$OUT/00_PUBLIC_UPLOAD_TERMINAL_LOG.txt"
STATUS=${pipestatus[1]}
set -e
unset SERVER_KEY

if [[ "$STATUS" -ne 0 ]]; then
  echo "UPLOAD STOPPED. Completed uploads, if any, remain recorded for safe resume."
  exit "$STATUS"
fi

echo "UPLOAD COMMAND FINISHED SUCCESSFULLY"
