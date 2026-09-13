# Collection procedure

<!-- source-of-truth: gathering branch-status facts (local git + optional gh). -->
<!-- doc-meta: owner=eng | last-reviewed=2026-09-13 -->

Use `scripts/collect.sh` first. If the script is missing or fails, use this procedure.

## Resolve base

```bash
git rev-parse --show-toplevel
git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null || true
# prefer origin/main, else origin/master, else main, else master
```

## Local unique tips

Walk each local branch. If the user asks, also walk `refs/remotes/origin/*` that has no local branch. If the user did not ask, skip remote-only tips.

```bash
git for-each-ref --format='%(refname:short)|%(committerdate:unix)|%(objectname:short)' refs/heads/
git rev-list --count "$BASE..$BRANCH"          # ahead
git rev-list --count "$BRANCH..$BASE"          # behind
git log --format='%s' "$BASE..$BRANCH" | head -5
```

Drop branches with ahead = 0.

## Open PRs (optional)

```bash
gh pr list --state open --limit 100 \
  --json number,title,headRefName,baseRefName,isDraft,updatedAt,url,reviewDecision
```

If `gh` is absent or errors, note `prs: unavailable` and continue.

## Stack edges

From each open PR: edge `headRefName` → `baseRefName`.

Walk chains until base is the repo default base (or a name with no open PR as head). Detect cycles. If you find a cycle, list nodes flat and mark `cycle`.

Local-only ancestry hint (no PR): if branch A's tip is an ancestor of branch B's tip and both have unique commits, B can sit atop A. Report that as **possible stack (local only)**, not a confirmed PR stack.

## Freshness

- Tip age: days since tip committer unix time.
- PR age: days since `updatedAt`.
- If the user did not ask for a fetch, do not run `git fetch`.
