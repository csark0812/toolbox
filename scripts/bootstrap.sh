#!/usr/bin/env bash
# Bootstrap toolbox on a new machine.
# Prerequisites: brew install git-crypt gnupg; GPG key imported; gh auth login
set -euo pipefail

export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

GITHUB_USER="${TOOLBOX_GITHUB_USER:-csark0812}"
REPO="${TOOLBOX_REPO:-toolbox}"
DIR="${TOOLBOX_DIR:-$HOME/Repositories/toolbox}"

gh auth status -h github.com >/dev/null

command -v git-crypt >/dev/null || {
  echo "Install: brew install git-crypt gnupg" >&2
  exit 1
}

mkdir -p "$(dirname "$DIR")"

if [ ! -d "$DIR/.git" ]; then
  git clone "git@github.com:${GITHUB_USER}/${REPO}.git" "$DIR"
fi

cd "$DIR"
git pull --ff-only

git-crypt unlock || {
  echo "git-crypt unlock failed. Import GPG key first:" >&2
  echo "  gpg --import /path/to/toolbox-gpg-secret.asc" >&2
  echo "See docs/gpg-second-machine.md" >&2
  exit 1
}

npx skills add "$DIR/personal" -g -a cursor -a claude-code -s '*' -y
npx skills list -g

echo "Toolbox ready at $DIR"
