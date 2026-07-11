#!/usr/bin/env bash
# Vendor team skills from toolbox into a project's .claude/skills/
# Usage: ./scripts/sync.sh <project-root> [slugs-file]
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: $0 <project-root> [slugs-file]" >&2
  exit 1
fi

PROJECT_ROOT="$1"
SLUGS_FILE="${2:-$(cd "$(dirname "$0")/.." && pwd)/shared.slugs}"
HUB="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$PROJECT_ROOT/.claude/skills"

if [ ! -d "$PROJECT_ROOT" ]; then
  echo "Project root not found: $PROJECT_ROOT" >&2
  exit 1
fi

if [ ! -f "$SLUGS_FILE" ]; then
  echo "Slugs file not found: $SLUGS_FILE" >&2
  exit 1
fi

mkdir -p "$DEST"
count=0

while IFS= read -r slug || [ -n "$slug" ]; do
  slug="${slug%%#*}"
  slug="$(echo "$slug" | xargs)"
  [ -z "$slug" ] && continue

  src="$HUB/team/$slug"
  if [ ! -d "$src" ]; then
    echo "WARN: team skill not found, skipping: $slug" >&2
    continue
  fi

  rsync -a --delete "$src/" "$DEST/$slug/"
  count=$((count + 1))
done < "$SLUGS_FILE"

# Sync shared references if present
if [ -d "$HUB/team/references" ]; then
  rsync -a "$HUB/team/references/" "$DEST/references/"
fi

echo "Synced $count team skill(s) -> $DEST"
