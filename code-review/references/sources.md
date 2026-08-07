# Review surface adapters

<!-- doc-meta: owner=eng | last-reviewed=2026-08-07 -->

How to **acquire review materials** — not every review is a git diff. Procedure → [review.md](review.md).

**Surface** = the code (or paste) the reviewer reads. **Lens** = what the user wants judged — set in header `Lens:` and filing mode ([merge-blockers.md](merge-blockers.md)).

Adapters and lens labels below are **starting points**, not a closed set. If the user’s ask does not fit a row, pick the closest adapter. Name the actual scope in the header. Use their wording for emphasis and filing.

## Pick a surface adapter

| Adapter         | When                                                    | Acquire                                                                                    |
| --------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| **uncommitted** | Working tree changes                                    | `git status --short` · `git diff --stat -- .` · `git diff -- .` · `git diff --cached -- .` |
| **staged-only** | Staged / pre-commit only                                | `git status --short` · `git diff --cached --stat` · `git diff --cached`                    |
| **commit**      | Single commit                                           | `git show --stat` · `git show`                                                             |
| **branch**      | Branch vs base                                          | fetch + stat + diff (below)                                                                |
| **pr**          | Open PR                                                 | Same as **branch**. Optional `gh pr view` for context                                      |
| **paths**       | Named files, module, directory — **no diff required**   | Read files in scope. Optional `git log -n 5 -- <paths>` for recent churn context only      |
| **snapshot**    | “Review this code”, security/cleanliness pass on a area | Same as **paths** — holistic read of in-scope files, not hunk-by-hunk                      |
| **external**    | Pasted snippet or attachment                            | User-supplied text. Read repo paths when referenced                                        |

**Change-shaped** surfaces (diff adapters) → default **introduced-only** evidence ([review.md](review.md)). **Snapshot/path** surfaces → judge **in-scope material**. Pre-existing issues are in scope unless user narrowed to “changes only”.

## Branch / PR diff

When the surface is a change set:

```bash
git fetch origin <base>
git diff --stat origin/<base>...HEAD
git diff origin/<base>...HEAD
```

Path-scoped diff: append `-- src/module/` to both commands.

## Lens (user intent — not a separate adapter)

Record in header as `Lens:` when the user names a focus. Use a **kebab-case slug** from the table when it fits. Otherwise use the user’s phrase (for example `Lens: performance`, `Lens: api-breaking-changes`).

| User ask (examples)             | `Lens:` (examples)  | Filing hint                                                    |
| ------------------------------- | ------------------- | -------------------------------------------------------------- |
| Default / “review my changes”   | `general` (omit ok) | merge-blockers only                                            |
| “Security review”, “auth flaws” | `security`          | merge-blockers — reachable vulns are Action                    |
| “Cleanliness”, “style”, “nits”  | `cleanliness`       | **improvements mode** ([merge-blockers.md](merge-blockers.md)) |
| “Merge-ready”, “ship it”        | `merge-readiness`   | merge-blockers + review status lines ([output.md](output.md))  |
| Anything else                   | user-named slug     | infer filing from user words. Ask once if ambiguous            |

Lens adjusts **emphasis** and **default filing** — it does not replace acquiring a surface. Combine freely: `source:snapshot` + `Lens: security`, `source:branch` + `Lens: performance`, and more.

## Framing

- **paths** / **snapshot** — If directory or symbol scope is ambiguous, make sure that scope is clear.
- **uncommitted** — can include unrelated dirty files. If scope is ambiguous, make sure that scope is clear.
- **merge-readiness** — include review status per [output.md](output.md).

If surface or lens is unclear, ask once before reviewing.
