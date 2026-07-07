#!/usr/bin/env bash
# =============================================================================
# Shayga — Seed image downloader (Pinterest)
# =============================================================================
# Downloads images from Pinterest using the pinterest-dl package.
# Safe to re-run: already existing files are skipped.
#
# Usage:
#   bash scripts/download-images.sh
# =============================================================================

set -euo pipefail

PROD="public/images/products"
BLOG="public/images/blogs"
HERO="public/images/hero"
AVTR="public/images/avatars"
IG="public/images/instagram"
TEMP_DIR="/tmp/shayga-pinterest-dl"

mkdir -p "$PROD" "$BLOG" "$HERO" "$AVTR" "$IG"

# Quick skip check: if all expected files already exist and are ≥8KB, bail out
all_exist() {
  local dir="$1" prefix="$2" ext="$3" count="$4" pad="$5"
  local i f
  for i in $(seq 1 "$count"); do
    if [ "$pad" = "yes" ]; then
      f=$(printf "%s/%s-%02d.%s" "$dir" "$prefix" "$i" "$ext")
    else
      f=$(printf "%s/%s-%d.%s" "$dir" "$prefix" "$i" "$ext")
    fi
    [ -f "$f" ] && [ "$(wc -c < "$f" 2>/dev/null || echo 0)" -ge 8192 ] || return 1
  done
  return 0
}

all_exist "$PROD" saree jpg 23 yes && all_exist "$BLOG" blog jpg 5 no && all_exist "$HERO" hero jpg 2 no && all_exist "$AVTR" avatar jpg 3 no && all_exist "$IG" ig jpg 5 no && { echo "  ✅  All seed images already present. Skipping."; exit 0; }

# Download a batch from Pinterest to a temp dir, then rename sequentially.
# Args: query dest_dir prefix ext count printf_fmt
download_batch() {
  local query="$1" dest_dir="$2" prefix="$3" ext="$4" count="$5" fmt="$6"
  local tmp_dir="$TEMP_DIR/$(basename "$dest_dir")"

  echo ""
  echo "  📸  $(basename "$dest_dir") ($count images, query: \"$query\")..."
  rm -rf "$tmp_dir"
  mkdir -p "$tmp_dir"

  uv run scripts/pinterest-dl.py "$query" "$tmp_dir" --num "$count" --delay 0.5

  local i=1
  while IFS= read -r -d '' f; do
    local dest
    dest=$(printf "%s/%s-${fmt}.%s" "$dest_dir" "$prefix" "$i" "$ext")
    if [[ "$f" != *."$ext" ]]; then
      sips -s format jpeg "$f" --out "$dest" &>/dev/null
    else
      cp "$f" "$dest"
    fi
    echo "    ✅  $(basename "$dest")"
    i=$((i + 1))
  done < <(find "$tmp_dir" -maxdepth 1 -type f \( -name '*.jpg' -o -name '*.jpeg' -o -name '*.png' -o -name '*.webp' \) -print0)
}

# ---------------------------------------------------------------------------
# Product images — 23 saree photos (zero-padded: saree-01.jpg)
# ---------------------------------------------------------------------------
download_batch "saaree instagram models" "$PROD" saree jpg 23 "%02d"

# ---------------------------------------------------------------------------
# Blog images — 5 featured images (blog-1.jpg to blog-5.jpg)
# ---------------------------------------------------------------------------
download_batch "indian saree fashion models" "$BLOG" blog jpg 5 "%d"

# ---------------------------------------------------------------------------
# Hero images — 2 wide-format images (hero-1.jpg, hero-2.jpg)
# ---------------------------------------------------------------------------
download_batch "indian wedding saree model" "$HERO" hero jpg 2 "%d"

# ---------------------------------------------------------------------------
# Avatar images — 3 square portraits (avatar-1.jpg to avatar-3.jpg)
# ---------------------------------------------------------------------------
download_batch "indian fashion model portrait" "$AVTR" avatar jpg 3 "%d"

# ---------------------------------------------------------------------------
# Instagram gallery images — 5 square photos (ig-1.jpg to ig-5.jpg)
# ---------------------------------------------------------------------------
download_batch "indian saree instagram style model" "$IG" ig jpg 5 "%d"

echo ""
echo "  ✅  All seed images downloaded."
