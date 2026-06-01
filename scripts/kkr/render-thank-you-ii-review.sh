#!/usr/bin/env bash
set -euo pipefail

RAW_DIR="public/mothers-day/thank-you/kks-expanded"
OUT_DIR="public/kkr/ii-review/thank-you"
TWINKLE="public/mothers-day/signatures/get-so-down-4m11-4m19-soft-signature.mp3"

mkdir -p "$OUT_DIR"

if [ ! -f "$TWINKLE" ]; then
  echo "MISSING TWINKLE/SIGNATURE FILE: $TWINKLE"
  exit 1
fi

render_ii () {
  local id="$1"
  local raw="$RAW_DIR/$id.mp3"
  local out="$OUT_DIR/$id-ii-pad1s-twinkle.mp3"

  if [ ! -f "$raw" ]; then
    echo "MISSING RAW KK: $raw"
    exit 1
  fi

  echo "RENDER II REVIEW: $id"

  ffmpeg -y \
    -f lavfi -t 1.0 -i anullsrc=channel_layout=stereo:sample_rate=44100 \
    -i "$raw" \
    -f lavfi -t 0.75 -i anullsrc=channel_layout=stereo:sample_rate=44100 \
    -i "$TWINKLE" \
    -filter_complex "[0:a][1:a][2:a][3:a]concat=n=4:v=0:a=1,afade=t=in:st=0:d=0.08[a]" \
    -map "[a]" \
    -codec:a libmp3lame -b:a 192k \
    "$out"
}

render_ii "thank-you-sec-outro"
render_ii "thank-you-sec-ch2"
render_ii "thank-you-sec-br"
render_ii "thank-you-sec-v1a"
render_ii "thank-you-sec-v1b"
render_ii "thank-you-sec-prech1"
render_ii "thank-you-sec-ch1"
render_ii "thank-you-sec-v2a"
render_ii "thank-you-sec-v2b"

echo "DONE: II review renders written to $OUT_DIR"
