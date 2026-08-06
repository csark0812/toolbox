# Review surface adapters

<!-- doc-meta: owner=eng | last-reviewed=2026-08-06 -->

How to **acquire review materials** — not every review is a git diff. Procedure → [review.md](review.md).

**Surface** = the code (or paste) the reviewer reads. **Lens** = what the user wants judged (security, cleanliness, merge-readiness) — set in header `Lens:` and filing mode ([merge-blockers.md](merge-blockers.md)).

## Pick a surface adapter

| Adapter         | When                                                    | Acquire                                                                                    |
| --------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| **uncommitted** | Working tree changes                                    | `git status --short` · `git diff --stat -- .` · `git diff -- .` · `git diff --cached -- .` |
| **staged-only** | Staged / pre-commit only                                | `git status --short` · `git diff --cached --stat` · `git diff --cached`                    |
| **commit**      | Single commit                                           | `git show --stat` · `git show`                                                             |
| **branch**      | Branch vs base                                          | fetch + stat + diff (below)                                                                |
| **pr**          | Open PR                                                 | Same as **branch**; optional `gh pr view` for context                                      |
| **paths**       | Named files, module, directory — **no diff required**   | Read files in scope; optional `git log -n 5 -- <paths>` for recent churn context only      |
| **snapshot**    | “Review this code”, security/cleanliness pass on a area | Same as **paths** — holistic read of in-scope files, not hunk-by-hunk                      |
| **external**    | Pasted snippet or attachment                            | User-supplied text; read repo paths when referenced                                        |

**Change-shaped** surfaces (diff adapters) → default **introduced-only** evidence ([review.md](review.md)). **Snapshot/path** surfaces → judge **in-scope material**; pre-existing issues are in scope unless user narrowed to “changes only”.

## Branch / PR diff

When the surface is a change set:

```bash
git fetch origin <base>
git diff --stat origin/<base>...HEAD
git diff origin/<base>...HEAD
```

Path-scoped diff: append `-- src/module/` to both commands.

## Lens (user intent — not a separate adapter)

Record in header as `Lens:` when the user names a focus:

| User ask (examples)             | `Lens:`             | Filing                                                         |
| ------------------------------- | ------------------- | -------------------------------------------------------------- |
| Default / “review my changes”   | `general` (omit ok) | merge-blockers only                                            |
| “Security review”, “auth flaws” | `security`          | merge-blockers — reachable vulns are Action                    |
| “Cleanliness”, “style”, “nits”  | `cleanliness`       | **improvements mode** ([merge-blockers.md](merge-blockers.md)) |
| “Merge-ready”, “ship it”        | `merge-readiness`   | merge-blockers + review status lines ([output.md](output.md))  |

Lens adjusts **what you look for** and **filing breadth** — it does not replace acquiring a surface. “Review `src/auth/` for security” → `source:paths` or `snapshot` + `Lens: security`.

## Framing

- **paths** / **snapshot** — confirm directory or symbol scope if ambiguous.
- **uncommitted** — may include unrelated dirty files; confirm scope.
- **merge-readiness** — include review status per [output.md](output.md).

If surface or lens is unclear, ask once before reviewing.
