# Fix-loop ledger

<!-- doc-meta: owner=eng | last-reviewed=2026-07-14 -->

Portable state for review → fix → re-review convergence. The ledger travels in
the chat handoff and every contextual Full council prompt; do not rely on line
numbers or finding order as identity.

## Theme record

Use one row per root invariant, not per symptom:

```markdown
| theme_id         | invariant                                        | surfaces            | state  | closure evidence                                      | contradiction |
| ---------------- | ------------------------------------------------ | ------------------- | ------ | ----------------------------------------------------- | ------------- |
| path-containment | Resolved paths remain inside the configured root | runtime, CLI, tests | closed | negative traversal + symlink tests; full check passed | none          |
```

- `theme_id`: stable kebab-case identity retained across renamed findings and
  moved code.
- `invariant`: behavior that must remain true for all relevant inputs.
- `surfaces`: affected contracts such as runtime, schema, exported types, CLI,
  config, docs, persistence, permissions, generated output, and tests.
- `state`: `open`, `closed`, `reopened`, `superseded`, `wontfix`, or `deferred`.
- `closure evidence`: implementation path, regression/negative test,
  **variant coverage checked**, and validation command/result. State why a test
  is not possible when applicable.
- `contradiction`: disagreement between prior synthesis and fresh evidence.

## Invariant matrix

Before filing or closing a theme, derive only the applicable rows from the
diff. Add repo-specific dimensions when the changed behavior demands them.

| Change class                | Minimum dimensions to inspect                                                                                                                                                         |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Routing / validation        | empty, single, mixed, skipped, unknown; local vs CI; fail-open vs fail-closed                                                                                                         |
| Paths / files               | relative, absolute, normalized, traversal, symlink, missing target, platform separator                                                                                                |
| Source rewrites             | destination binding, titled links, duplicate URL text, inline links, reference definitions, label/title collisions, parser offsets, fence, inline code, prefix/suffix, generated file |
| Public contracts            | runtime, schema, exported declarations, docs/examples, CLI help, error behavior, generated artifacts                                                                                  |
| State / cache / persistence | read key, write key, invalidation, migration, retry, stale/concurrent state                                                                                                           |
| Auth / permissions          | anonymous, least privilege, denied, expired, cross-tenant, partial failure                                                                                                            |

The matrix is a review aid, not a mandate to file test inventory. Default filing
remains merge-blockers only.

## Variant coverage before closure

Do not mark a theme `closed` after fixing only the reported example. Before
closure evidence is complete:

1. List the applicable matrix dimensions for that invariant.
2. Check each dimension for the same failure mode (or state why it does not
   apply).
3. Prefer one theme-complete fix + regression coverage over a symptom patch.

If a later pass finds the **same invariant + a new edge**, prior closure
evidence was incomplete. Reopen the existing `theme_id`; do not invent a fresh
sibling theme for the adjacent hole.

Ask on every narrow fix: “what other variants of this invariant would fail if
this fix is too narrow?”

## Reconciliation

For every candidate found on pass 2+, classify it before synthesis:

1. Same theme, incomplete fix → reopen the existing `theme_id`.
2. Same invariant, new variant → add evidence under the existing theme
   (prior closure incomplete).
3. Genuinely different invariant → create a new `theme_id` and state in one line
   why prior passes missed this blocker class.
4. No reachable production failure → Noted or Deferred under normal filing rules.

## Hotspots

Before an exit pass, identify files or subsystems changed in two or more fix
commits/passes. Assign one council member or the coordinator to read each
hotspot holistically against its invariant matrix, not only the latest patch.

## Exit gate

Use merge-ready or “final blockers” language only when all are true:

- No ledger theme remains `open` or `reopened`; `wontfix` decisions are explicit.
- Baseline contradictions are empty.
- Repeatedly changed hotspots received aggregate re-review.
- Every repeated Action theme has variant coverage checked, plus a regression
  test or a written reason one is not possible.
- The repository’s authoritative validation lane passed, or the output clearly
  states which validation was not run and does not claim merge-ready.

Zero findings alone does not satisfy this gate.
