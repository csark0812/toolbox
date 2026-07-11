#!/usr/bin/env bash
# Export GPG secret key for second-machine setup. Store output securely (1Password, offline).
# Usage: ./scripts/export-gpg-key.sh [key-id]
set -euo pipefail

export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

KEY_ID="${1:-$(gpg --list-secret-keys --keyid-format=long 2>/dev/null | awk '/^sec/ {print $2}' | head -1 | cut -d'/' -f2)}"

if [ -z "$KEY_ID" ]; then
  echo "No GPG secret key found. Generate one first." >&2
  exit 1
fi

OUT="${HOME}/toolbox-gpg-secret-${KEY_ID}.asc"
gpg --export-secret-keys "$KEY_ID" > "$OUT"
chmod 600 "$OUT"

echo "Exported: $OUT"
echo "Store securely. Import on second machine:"
echo "  gpg --import $OUT"
echo "  rm $OUT   # after import"
