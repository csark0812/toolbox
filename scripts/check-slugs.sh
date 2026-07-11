#!/usr/bin/env bash
# Verify shared.slugs matches skill directories on disk.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SLUGS_FILE="${1:-$ROOT/shared.slugs}"

if [ ! -f "$SLUGS_FILE" ]; then
  echo "Slugs file not found: $SLUGS_FILE" >&2
  exit 1
fi

declare -a listed=()
while IFS= read -r slug || [ -n "$slug" ]; do
  slug="${slug%%#*}"
  slug="${slug#"${slug%%[![:space:]]*}"}"
  slug="${slug%"${slug##*[![:space:]]}"}"
  [ -z "$slug" ] && continue
  listed+=("$slug")
  if [ ! -f "$ROOT/$slug/SKILL.md" ]; then
    echo "ERROR: slug in shared.slugs missing SKILL.md: $slug" >&2
    exit 1
  fi
done < "$SLUGS_FILE"

# Public skill dirs at repo root (flat layout)
for dir in "$ROOT"/*/; do
  [ -d "$dir" ] || continue
  name="$(basename "$dir")"
  case "$name" in
    docs|references|scripts|node_modules|.skeleton|.github) continue ;;
  esac
  [ -f "$dir/SKILL.md" ] || continue
  found=0
  for slug in "${listed[@]}"; do
    if [ "$slug" = "$name" ]; then
      found=1
      break
    fi
  done
  if [ "$found" -eq 0 ]; then
    echo "ERROR: public skill dir not in shared.slugs: $name" >&2
    exit 1
  fi
done

echo "shared.slugs OK (${#listed[@]} slugs)"
