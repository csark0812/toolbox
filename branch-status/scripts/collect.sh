#!/usr/bin/env bash
# Collect unique-ahead branches + open PR stack edges for branch-status.
# Read-only. No fetch. Prints a simple text report on stdout.
set -euo pipefail

if ! git rev-parse --show-toplevel >/dev/null 2>&1; then
  echo "error: not a git repository" >&2
  exit 1
fi

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

resolve_base() {
  local candidate
  if candidate=$(git symbolic-ref --quiet --short refs/remotes/origin/HEAD 2>/dev/null); then
    echo "${candidate#origin/}"
    return
  fi
  for candidate in main master; do
    if git show-ref --verify --quiet "refs/heads/$candidate" \
      || git show-ref --verify --quiet "refs/remotes/origin/$candidate"; then
      echo "$candidate"
      return
    fi
  done
  echo "main"
}

BASE="$(resolve_base)"
if git show-ref --verify --quiet "refs/remotes/origin/$BASE"; then
  BASE_REF="origin/$BASE"
elif git show-ref --verify --quiet "refs/heads/$BASE"; then
  BASE_REF="$BASE"
else
  echo "error: cannot resolve base '$BASE'" >&2
  exit 1
fi

CURRENT="$(git branch --show-current 2>/dev/null || true)"
NOW_EPOCH="$(date +%s)"
AS_OF="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

echo "repo=$ROOT"
echo "base=$BASE"
echo "base_ref=$BASE_REF"
echo "current=${CURRENT:-}"
echo "as_of=$AS_OF"
echo

echo "## trains"
EMPTY=0
while IFS= read -r line; do
  branch="${line%%|*}"
  rest="${line#*|}"
  tip_epoch="${rest%%|*}"
  tip_short="${rest##*|}"

  ahead="$(git rev-list --count "$BASE_REF..$branch" 2>/dev/null || echo 0)"
  if [[ "$ahead" -eq 0 ]]; then
    EMPTY=$((EMPTY + 1))
    continue
  fi
  behind="$(git rev-list --count "$branch..$BASE_REF" 2>/dev/null || echo 0)"
  age_days=$(( (NOW_EPOCH - tip_epoch) / 86400 ))
  marker=""
  if [[ "$branch" == "$CURRENT" ]]; then
    marker="*"
  fi

  subjects="$(git log --format='%s' "$BASE_REF..$branch" 2>/dev/null | head -5 | paste -sd ' || ' -)"
  printf 'branch=%s%s|ahead=%s|behind=%s|tip=%s|age_days=%s|subjects=%s\n' \
    "$marker" "$branch" "$ahead" "$behind" "$tip_short" "$age_days" "$subjects"
done < <(git for-each-ref --sort=-committerdate \
  --format='%(refname:short)|%(committerdate:unix)|%(objectname:short)' refs/heads/)

echo "empty_tips=$EMPTY"
echo

echo "## prs"
if command -v gh >/dev/null 2>&1; then
  if ! gh pr list --state open --limit 100 \
    --json number,title,headRefName,baseRefName,isDraft,updatedAt,url,reviewDecision \
    2>/dev/null; then
    echo 'prs_status=unavailable'
  fi
else
  echo 'prs_status=gh_missing'
fi
