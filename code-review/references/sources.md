# Source adapters

<!-- doc-meta: owner=eng | last-reviewed=2026-08-06 -->

How to **acquire** the review surface. Procedure → [review.md](review.md).

## Pick an adapter

| Adapter         | When                                         | Acquire                                                                                    |
| --------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------ |
| **uncommitted** | Working tree (staged + unstaged + untracked) | `git status --short` · `git diff --stat -- .` · `git diff -- .` · `git diff --cached -- .` |
| **staged-only** | Staged / pre-commit only                     | `git status --short` · `git diff --cached --stat` · `git diff --cached`                    |
| **commit**      | Single commit (`HEAD`, SHA, “latest commit”) | `git show --stat` · `git show`                                                             |
| **branch**      | Branch vs base, `review vs main`             | fetch + stat + diff (below)                                                                |
| **pr**          | Open PR                                      | Same as **branch**; optional `gh pr view` for context                                      |
| **paths**       | Named files or directories                   | Parent adapter + `-- <paths>` on every diff command                                        |
| **external**    | Pasted patch                                 | User-supplied diff; read repo when paths exist                                             |

## Branch / PR diff

```bash
git fetch origin <base>    # default main; or gh pr view --json baseRefName
git diff --stat origin/<base>...HEAD
git diff origin/<base>...HEAD
```

Path-scoped: append `-- src/module/` to both diff commands.

## Framing

- **uncommitted** — may include unrelated dirty files; confirm scope if ambiguous.
- **paths** — introduced-only within named paths unless user widened scope.
- **merge-readiness** — when user asks ship / merge-ready, include review status per [output.md](output.md).

If scoped paths or base branch are unclear, ask before reviewing.
