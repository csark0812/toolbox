# Branch classification commands

Run from repo root after `git fetch origin --prune`.

## Remote branches (ahead / behind / date)

```bash
git for-each-ref --format='%(refname:short)' refs/remotes/origin/ \
  | grep -E '^origin/.+' | grep -v '^origin/main$' \
  | while read ref; do
      ahead=$(git rev-list --count "origin/main..$ref" 2>/dev/null)
      behind=$(git rev-list --count "$ref..origin/main" 2>/dev/null)
      date=$(git log -1 --format='%ci' "$ref" 2>/dev/null | cut -d' ' -f1)
      msg=$(git log -1 --format='%s' "$ref" 2>/dev/null)
      echo "$ahead|$behind|$date|$ref|$msg"
    done | sort -t'|' -k1 -n -k2 -n
```

- **Merged:** `ahead = 0`
- **Stale signal:** `ahead > 0` and (`behind > 50` or date older than 30 days)

## Local branches (0-ahead of main)

```bash
git for-each-ref --format='%(refname:short)' refs/heads/ \
  | grep -v '^main$' \
  | while read ref; do
      ahead=$(git rev-list --count "origin/main..$ref" 2>/dev/null)
      [ "$ahead" = "0" ] && echo "LOCAL_MERGED $ref"
    done
```

Delete with `git branch -D` when `-d` fails (squash merge / wrong HEAD).

## Worktrees

```bash
git worktree list
```

Cross-check each path: branch name, commit, `git status -sb`, upstream gone (`[gone]`), match against primary worktree branch+SHA.

## Open PRs (optional)

```bash
gh pr list --state open --json number,headRefName,baseRefName,title \
  --jq '.[] | "\(.number)\t\(.headRefName)\t\(.baseRefName)\t\(.title)"'
```

Branch with open PR → **Active**, not stale-delete.

## Delete merged remote (batch)

Only refs with `ahead = 0`:

```bash
git for-each-ref --format='%(refname:short)' refs/remotes/origin/ \
  | grep -E '^origin/.+' | grep -v '^origin/main$' \
  | while read ref; do
      ahead=$(git rev-list --count "origin/main..$ref" 2>/dev/null)
      [ "$ahead" = "0" ] && git push origin --delete "${ref#origin/}"
    done
```

Stop on first push failure; report and continue only if user asks.
