# Source adapters

How to **acquire** the review surface. Source chooses git commands and light framing only — not review intensity, filing, or council spawn. Intensity → [surfaces.md](surfaces.md). Procedure → [review.md](review.md).

## Pick an adapter

| Adapter            | When                                              | Acquire (run in order)                                                                                                     |
| ------------------ | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **uncommitted**    | Staged, unstaged, and/or untracked working tree   | `git status --short` · `git diff --stat -- .` · `git diff -- .` · `git diff --cached -- .` · read material untracked files |
| **staged-only**    | User asks staged / pre-commit / `--cached` only   | `git status --short` · `git diff --cached --stat` · `git diff --cached`                                                    |
| **commit**         | Single commit (`HEAD`, SHA, or “latest commit”)   | `git show --stat` · `git show` (or `git show <sha>`)                                                                       |
| **branch**         | Branch vs base, `review vs main`, merge readiness | [shared.md](shared.md) fetch + stat + diff                                                                                 |
| **pr**             | Open PR / explicit PR review                      | Same as **branch**; optional `gh pr view` for base/title/body context                                                      |
| **paths**          | User names files, modules, or directories         | Parent adapter + `-- <paths>` on every diff command                                                                        |
| **implementation** | Implementation review of named modules            | **paths** + holistic read of module boundaries (not line-only)                                                             |
| **external**       | Pasted patch or attachment                        | User-supplied diff; read repo only when paths exist                                                                        |

**Legacy mode names** (route here, do not treat as separate skills):

| Legacy prompt                      | Adapter                                                                    |
| ---------------------------------- | -------------------------------------------------------------------------- |
| `staged`, `unstaged`, `pre-commit` | **uncommitted** (full tree) or **staged-only** when explicitly staged-only |
| `commit`                           | **commit**                                                                 |
| `pr`, `merge`, `review vs main`    | **branch** or **pr**                                                       |
| `implementation`                   | **implementation**                                                         |

## Framing (not a separate path)

Add at most one short framing line in the synthesis header or change summary when relevant:

- **uncommitted** — surface may include unrelated dirty files; confirm scope if ambiguous.
- **pr** / **branch** — base resolved via [shared.md](shared.md); empty diff against wrong base is not “nothing to review.”
- **paths** / **implementation** — scoped surface; introduced-only within paths unless user widened scope.
- **merge-readiness** — when the user asks merge-ready / ship / “good to merge”, include review status per [output.md](output.md) § Review status.

## Path-scoped diffs

When paths are named, every diff command from the parent adapter must include `-- <paths>`.

```bash
git fetch origin <base>   # branch/pr only
git diff --stat origin/<base>...HEAD -- src/auth/
git diff origin/<base>...HEAD -- src/auth/
```

If scoped paths are unclear, ask before reviewing.
