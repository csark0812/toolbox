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

git-crypt unlock || {
  echo "git-crypt unlock failed. Import GPG key first:" >&2
  echo "  gpg --import /path/to/toolbox-gpg-secret.asc" >&2
  echo "See docs/gpg-second-machine.md" >&2
  exit 1
}

# Symlink personal skills (live updates on git pull; npx skills copies for local paths)
mkdir -p "$HOME/.agents/skills" "$HOME/.claude/skills"
for skill_dir in "$DIR"/personal/*/; do
  [ -f "${skill_dir}SKILL.md" ] || continue
  slug="$(basename "$skill_dir")"
  [ "$slug" = "raw" ] && continue
  rm -rf "$HOME/.agents/skills/$slug"
  ln -sfn "$skill_dir" "$HOME/.agents/skills/$slug"
  ln -sfn "$HOME/.agents/skills/$slug" "$HOME/.claude/skills/$slug"
  echo "Linked $slug -> $skill_dir"
done

echo "Toolbox ready at $DIR"
