#!/usr/bin/env bash
# =============================================================================
# Shagya — Seed image downloader
# =============================================================================
# Downloads every image required by scripts/seed.ts from Pexels (free, CC0).
# Safe to re-run: files that are already present and ≥ 8 KB are skipped.
#
# Usage:
#   bash scripts/download-images.sh
# =============================================================================

set -euo pipefail

PROD="public/images/products"
BLOG="public/images/blogs"
HERO="public/images/hero"
AVTR="public/images/avatars"
BASE="https://images.pexels.com/photos"

mkdir -p "$PROD" "$BLOG" "$HERO" "$AVTR"

# Returns 0 (true) when the file is missing or suspiciously small (< 8 KB).
needs_download() {
  local f="$1"
  [ ! -f "$f" ] && return 0
  local size
  size=$(wc -c < "$f" 2>/dev/null || echo 0)
  [ "$size" -lt 8192 ]
}

fetch() {
  local dest="$1" url="$2"
  if needs_download "$dest"; then
    if curl -sf --retry 2 -L -o "$dest" "$url"; then
      printf "    ✅  %s\n" "$(basename "$dest")"
    else
      printf "    ⚠️   %s — download failed\n" "$(basename "$dest")"
    fi
  else
    printf "    ⏭   %s\n" "$(basename "$dest")"
  fi
}

# ---------------------------------------------------------------------------
# Product images — 20 saree photos (young Indian women in sarees)
# Source: Pexels free license, no attribution required
# ---------------------------------------------------------------------------
echo "  📸  Product images (20 sarees)..."
PRODUCT_IDS=(
  7176438  7176430  20442943 36266690 18535336
  15678823 33078836 27630600 33067044 18535332
  17184880 7176435  17876038 36226633 18606434
  16709246 33306336 38039334 33729218 27719397
)
for i in "${!PRODUCT_IDS[@]}"; do
  N=$(printf "%02d" $((i + 1)))
  ID="${PRODUCT_IDS[$i]}"
  fetch "$PROD/saree-${N}.jpg" \
    "${BASE}/${ID}/pexels-photo-${ID}.jpeg?auto=compress&cs=tinysrgb&w=800&h=1000&fit=crop" &
done
wait

# ---------------------------------------------------------------------------
# Blog images — 5 featured images for journal posts
# ---------------------------------------------------------------------------
echo "  📸  Blog / journal images (5)..."
BLOG_IDS=(27719403 38039330 37951159 33729218 27630600)
for i in "${!BLOG_IDS[@]}"; do
  N=$((i + 1))
  ID="${BLOG_IDS[$i]}"
  fetch "$BLOG/blog-${N}.jpg" \
    "${BASE}/${ID}/pexels-photo-${ID}.jpeg?auto=compress&cs=tinysrgb&w=1200&h=630&fit=crop" &
done
wait

# ---------------------------------------------------------------------------
# Hero images — 3 wide-format images (homepage panels + craft story)
# ---------------------------------------------------------------------------
echo "  📸  Hero images (3)..."
HERO_IDS=(19764064 37054322 33306336)
for i in "${!HERO_IDS[@]}"; do
  N=$((i + 1))
  ID="${HERO_IDS[$i]}"
  fetch "$HERO/hero-${N}.jpg" \
    "${BASE}/${ID}/pexels-photo-${ID}.jpeg?auto=compress&cs=tinysrgb&w=1600&h=1000&fit=crop" &
done
wait

# ---------------------------------------------------------------------------
# Avatar images — 3 square portraits (for future review / author use)
# ---------------------------------------------------------------------------
echo "  📸  Avatar images (3)..."
AVTR_IDS=(7176438 7176430 20442943)
for i in "${!AVTR_IDS[@]}"; do
  N=$((i + 1))
  ID="${AVTR_IDS[$i]}"
  fetch "$AVTR/avatar-${N}.jpg" \
    "${BASE}/${ID}/pexels-photo-${ID}.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop" &
done
wait

echo ""
echo "  ✅  All seed images ready."
