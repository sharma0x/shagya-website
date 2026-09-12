#!/usr/bin/env bash
# Detect semantic-release output after running `pnpm release`.
# Usage:
#   scripts/semantic-release.sh before-tag <tag>
#   scripts/semantic-release.sh detect     <before-tag>
#
# Outputs (GitHub Actions outputs via $GITHUB_OUTPUT):
#   released=true|false
#   version=<tag or empty>

set -euo pipefail

ACTION="${1:?Usage: $0 before-tag|detect <value>}"
VALUE="${2:-}"

case "$ACTION" in
  before-tag)
    echo "tag=${VALUE}"
    ;;
  detect)
    BEFORE_TAG="$VALUE"
    AFTER_TAG=$(git ls-remote --tags origin 'v*.*.*' \
      | cut -f2 \
      | sed 's#refs/tags/##' \
      | sort -V \
      | tail -1 || echo "")

    if [ -z "$AFTER_TAG" ]; then
      echo "released=false"
      echo "version="
    elif [ "$AFTER_TAG" = "$BEFORE_TAG" ]; then
      echo "released=false"
      echo "version="
    else
      echo "released=true"
      echo "version=$AFTER_TAG"
    fi
    ;;
  *)
    echo "Unknown action: $ACTION" >&2
    exit 1
    ;;
esac
