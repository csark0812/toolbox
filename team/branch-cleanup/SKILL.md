---
name: branch-cleanup
description: >-
  Inventory and clean merged or stale git branches (local + remote) and unused
  worktrees; flag branches with unique commits that look abandoned. User-invoked
  only — destructive git ops require explicit user approval per phase. Use when
  the user asks to clean up branches, worktrees, merged remotes, or prune stale
  git state after merges.
disable-model-invocation: true
---

# Branch cleanup

Prune **fully merged** branches and **unused** worktrees. **Never** auto-delete branches that still have commits not on `main` — flag those for review.

**Does not own:** starting work or PR hygiene → `project-tracking` · splitting stacked branches → user decision + `project-tracking` · post-merge memory log → `docs/memory/` only when user asks.

## Modes

| Mode | Trigger | Action |
|------|---------|--------|
| `inventory` | default, "what branches", "audit git" | Classify only — no deletes |
| `clean` | "delete merged", "clean up branches" | Delete **fully merged** local + remote after user confirms tier |
| `worktrees` | "clean worktrees", "remove worktrees" | Remove unused secondary worktrees after user confirms |

Run **`inventory` first** unless the user already confirmed deletes in the same message.

## Preflight

1. `git fetch origin --prune`
2. Resolve integration branch: **`origin/main`** (PostPrint default)
3. Record **current worktree path** and branch — never remove the worktree you are running from
4. `gh` available → enrich with open PR state (`gh pr list --state open`); optional if only inventory

## Fully merged definition (SSOT)

A branch is **fully merged into `main`** when it has **zero commits ahead** of `origin/main`:

```bash
git rev-list --count origin/main..<ref>   # must be 0
```

**Do not rely on** `git branch --merged` or `git branch -d` alone — squash merges and non-`main` HEAD make those lie. Local deletes for 0-ahead branches may require **`git branch -D`** when `main` is checked out in another worktree.

## Protocol

### 1. Inventory

Build four buckets (see [references/classify.md](references/classify.md) for commands):

| Bucket | Meaning | Default action |
|--------|---------|----------------|
| **Merged** | 0 ahead of `origin/main` | Safe to delete (local + remote) |
| **Active** | Ahead > 0, open PR, recent commit, or checked-out worktree | Keep |
| **Stale — review** | Ahead > 0 but likely abandoned (heuristics below) | **Flag only** — do not delete |
| **Worktree — removable** | Secondary worktree; merged / gone remote / detached scratch / duplicate checkout | Remove after confirm |

**Stale — review heuristics** (any + ahead > 0):

- Last commit **> 30 days** ago
- **> 50 commits behind** `origin/main`
- Upstream **`[gone]`** (remote deleted) but local/remote tip still has unique commits
- **No open PR** for the branch (when `gh` available)
- Duplicate: another worktree on the **same branch @ same commit** as primary

For each stale flag, include: branch name, ahead/behind counts, last commit date + subject, open PR # if any, worktree path if any, **one-line risk** (what unique work would be lost).

### 2. Clean (merged only)

Only after user confirms (explicit "delete merged" or approval of the **Merged** table):

**Remote** (0 ahead):

```bash
git push origin --delete <branch>
```

**Local** (0 ahead, skip `main` and current branch until switched):

```bash
git branch -D <branch>
```

Batch: loop `refs/heads` and `refs/remotes/origin/*`; skip `main`, `HEAD`, bare `origin` ref.

Report: deleted count, failures, remaining unmerged count.

### 3. Worktrees

List: `git worktree list`

**Keep:** the worktree running this skill; any worktree the user named as active; worktrees whose branch is **Active** with no duplicate.

**Remove** (after confirm): secondary paths where branch is **Merged**, remote **gone**, **detached HEAD** scratch, or **duplicate** of primary checkout.

```bash
git worktree remove <path> --force   # when untracked build artifacts block remove
git worktree prune
```

If `main` is only checked out elsewhere, do not checkout `main` in the primary tree — switch to an unmerged branch before deleting local merged branches.

## Safety gates

| Rule | Reason |
|------|--------|
| Never delete `main` | Protected |
| Never delete **Stale — review** without explicit per-branch approval | Unique commits may still matter |
| Never delete remote branches with ahead > 0 | Not merged |
| Never remove the current worktree | Active session |
| Stash or commit WIP before branch switches | Avoid data loss |
| Force-push is **out of scope** | Different skill / user request |

## Output format

Follow [references/output-schema.md](../references/output-schema.md).

```markdown
## Branch cleanup summary
- Mode: `inventory` | `clean` | `worktrees`
- Integration: `origin/main` @ `<sha>`
- Merged (deletable): N local · M remote
- Active (kept): …
- Stale — review: …
- Worktrees removed / kept: …

## Stale — review
| Branch | Ahead | Behind | Last commit | PR | Risk if deleted |
|--------|-------|--------|-------------|-----|-----------------|
| … | … | … | … | … | … |

## Actions taken
- …

## Next step
…
```

## Handoffs

- Open PRs to merge before re-cleanup → `project-tracking` `finish`
- Split monolithic branch before delete → user + `investigate` / `project-tracking`
- Session context for fresh chat → `handoff`
