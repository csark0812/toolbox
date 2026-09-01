# Review output

<!-- doc-meta: owner=eng | last-reviewed=2026-09-01 -->

Extends [output-schema.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/output-schema.md).

**Default filing:** merge-blockers only — [merge-blockers.md](merge-blockers.md).

User-facing blocks (status lines, finding titles, finding bodies, Noted/Deferred lines) must use pragmatic STE: short sentences, concrete subjects and verbs, and one meaning per sentence. If `simple-english` is installed, it can provide additional guidance; `code-review` does not require it.

## Status header (required)

First line of every review:

```markdown
Review · source:[adapter] · Scope: [N files, M loc] · Lens: [general|security|cleanliness|merge-readiness] · Filing: merge-blockers only
```

| Field     | Notes                                                                                         |
| --------- | --------------------------------------------------------------------------------------------- |
| `source:` | Surface adapter from [sources.md](sources.md) (`paths`, `snapshot`, `branch`, `external`, …)  |
| `Scope:`  | Files and approximate size in review scope                                                    |
| `Lens:`   | User focus. Omit, `general`, or any kebab-case slug (examples in sources.md — not exhaustive) |
| `Filing:` | `merge-blockers only` (default) or improvements mode per merge-blockers                       |

Optional one-line scope note can precede the header.

## Review status (merge-readiness asks only)

When the user asked merge-ready / ship / equivalent, follow [merge-readiness.md](merge-readiness.md) and place these lines after the header:

```text
Reviewed base: <base-ref>@<full SHA>
Diff base: <full merge-base SHA>
Reviewed head: <full SHA>
Current remote head: <full SHA> · match | mismatch
Contract: frozen | reconciled | unresolved · Sources: <named sources>
Coverage: full | partial · Lenses: <covered lenses>
State: PASSED | BLOCKED | INCOMPLETE | STALE
```

| State          | Status                                                                                   |
| -------------- | ---------------------------------------------------------------------------------------- |
| **PASSED**     | Emit exactly `No merge-blockers in scope.`                                               |
| **BLOCKED**    | Emit `N merge-blockers · …` and the Action findings.                                     |
| **INCOMPLETE** | State the missing coverage, evidence, or `contract-dependent` hold. Do not emit success. |
| **STALE**      | State which bound identity changed. Do not emit success.                                 |

`No findings in scope.` is not a merge-readiness success signal. It may be used on casual, non-gating reviews. The passed signal covers code quality for the displayed snapshot, contract, and scope only; it does not cover CI, approvals, conflicts, branch protection, or merge authorization.

## Finding blocks (Action)

One block per Action issue, severity descending. **Noted** and **Deferred** use one-line tails, not blocks.

```markdown
## Reset panelMode on host navigation

`<app>/path/File.tsx:71-85` · Severity: high · Scope: ship-blocker · Identity: new

Host navigation updates URL but `panelMode` is never reset. After SPA route change the panel can stay on the wrong mode.
```

**Title** — short imperative phrase.

**Location line** — `` `path:line` `` · Severity: critical|high|medium|low · Scope: ship-blocker|hardening · optional `· Identity: new|repeat` · optional `· Qualifier: regression` · optional `· Needs confirmation`. `Identity` is required on merge-readiness Action findings and optional otherwise.

**Body** — 1–4 STE sentences: starting state → trigger → failure → user impact.

`contract-dependent` is a non-Action review hold, not a location-line qualifier. `CI-only` belongs to a separate workflow and does not affect this code-quality result.

## Review holds

For merge readiness, list unresolved intent separately from Action findings:

```markdown
## Review holds

- contract-dependent · <behavior> · <conflicting or missing contract sources>
```

Any review hold requires `State: INCOMPLETE` and suppresses the clean signal. It does not count as a merge-blocker until an authoritative contract establishes the expected behavior and the Action bar is met.

## Noted (out of scope)

One line each when worth recording but not blocking:

```markdown
## Noted (out of PR scope)

- `utils_merge.py` — pre-existing · identifier collision · defer unless merge path hits duplicates
```

## Deferred improvements

Polish, test inventory, refactor — one line each:

```markdown
## Deferred improvements

- `tests/foo.py` — test inventory · NULL edge on slow path only
```

## Severity

| Level        | Bar                                           |
| ------------ | --------------------------------------------- |
| **critical** | Data loss, security exposure, core path break |
| **high**     | Core action fails. Bad state propagation.     |
| **medium**   | Non-core regression. Moderate edge case.      |
| **low**      | Rare edge. Contained scope.                   |

## Plain-text fallback

When `<details>` will not render: title line, location + severity + scope, then description paragraph.
