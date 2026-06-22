#!/usr/bin/env bash
set -euo pipefail

cd /Users/gputnammusicllc/Documents/GitHub/k-kut

TOKEN="$(grep '^MICHAEL_TP_ACCESS_TOKEN=' .env.local | tail -1 | cut -d= -f2-)"

if [ -z "$TOKEN" ]; then
  echo "Missing MICHAEL_TP_ACCESS_TOKEN in .env.local"
  exit 1
fi

open "http://localhost:3000/tp/michael-kleigh-marker?token=$TOKEN"
