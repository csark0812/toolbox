# Review output

<!-- doc-meta: owner=eng | last-reviewed=2026-08-06 -->

Extends [output-schema.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/output-schema.md).

**Default filing:** merge-blockers only — [merge-blockers.md](merge-blockers.md).

## Status header (required)

First line of every review:

```markdown
Review · source:[adapter] · Scope: [N files, M loc] · Lens: [general|security|cleanliness|merge-readiness] · Filing: merge-blockers only
```

| Field     | Notes                                                                                        |
| --------- | -------------------------------------------------------------------------------------------- |
| `source:` | Surface adapter from [sources.md](sources.md) (`paths`, `snapshot`, `branch`, `external`, …) |
| `Scope:`  | Files and approximate size in review scope                                                   |
| `Lens:`   | User focus; omit or `general` when unspecified                                               |
| `Filing:` | `merge-blockers only` (default) or improvements mode per merge-blockers                      |

Optional one-line scope note may precede the header.

## Review status (merge-readiness asks only)

When the user asked merge-ready / ship / equivalent:

| Situation              | Line                          |
| ---------------------- | ----------------------------- |
| No Action items        | `No findings in scope.`       |
| Only nonblocking items | `No merge-blockers in scope.` |
| Open merge-blockers    | `N merge-blockers · …`        |

Omit on casual reviews.

## Finding blocks (Action)

One block per Action issue, severity descending. **Noted** and **Deferred** use one-line tails, not blocks.

```markdown
## Reset panelMode on host navigation

`<app>/path/File.tsx:71-85` · Severity: high · Scope: ship-blocker

Host navigation updates URL but `panelMode` is never reset — after SPA route change the panel can stay on the wrong mode.
```

**Title** — short imperative phrase.

**Location line** — `` `path:line` `` · Severity: critical|high|medium|low · Scope: ship-blocker|hardening · optional `· Needs confirmation`

**Body** — 1–4 sentences: starting state → trigger → failure → user impact.

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
| **high**     | Core action fails; bad state propagation      |
| **medium**   | Non-core regression; moderate edge case       |
| **low**      | Rare edge; contained scope                    |

## Plain-text fallback

When `<details>` won't render: title line, location + severity + scope, then description paragraph.
