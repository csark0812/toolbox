# Merge-readiness attestation

<!-- source-of-truth: stateless code-review gate for an immutable branch or PR snapshot. -->
<!-- doc-meta: owner=eng | last-reviewed=2026-08-24 -->

Use this reference only for `Lens: merge-readiness` on a branch or PR. It defines a code-quality review gate, not permission to merge. CI, approvals, conflicts, branch protection, deployment checks, and the merge action stay outside this skill.

## States

```text
BOUND -> REVIEWING -> PASSED | BLOCKED | INCOMPLETE
   \          \          \
    \          \----------> STALE
     \--------------------> STALE
```

| State          | Meaning                                                                                         |
| -------------- | ----------------------------------------------------------------------------------------------- |
| **BOUND**      | Exact remote review identity, scope, lenses, boundary classes, and contract basis are recorded. |
| **REVIEWING**  | The reviewer is covering the bound surface and resolving evidence.                              |
| **PASSED**     | The bound identity is current, coverage is full, and no blocker or review hold remains.         |
| **BLOCKED**    | One or more confirmed code-quality merge-blockers remain.                                       |
| **INCOMPLETE** | Coverage or evidence is missing, or contract-dependent expected behavior remains unresolved.    |
| **STALE**      | Base, head, contract basis, or the requested scope changed after the review was bound.          |

When conditions overlap, use this precedence: `STALE` → `INCOMPLETE` → `BLOCKED` → `PASSED`. Preserve confirmed Action findings in an incomplete review, but do not issue a complete blocking or passing attestation until the hold is resolved.

This is per-run state only. Do not create a ledger, persist closure state, mutate a prior review, or coordinate repairs. A changed identity makes an earlier conclusion stale; historical evidence may inform a new review but cannot carry its pass result forward.

## Bind the review

Before reading a PR or branch for merge readiness, record:

- Repository and surface adapter.
- Remote base ref and full base-tip SHA.
- Full merge-base SHA used as the left side of the three-dot diff.
- Full reviewed head SHA.
- Declared paths and requested lenses.
- Applicable input, state, transport, and lifecycle classes.
- Named authoritative contract sources. Record a commit, revision, or content fingerprint for every mutable source; otherwise set `State: INCOMPLETE`.

Review immutable commit content. If local files are used, require local `HEAD` to equal the reviewed remote head and require the reviewed paths to have no staged, unstaged, or untracked changes. Otherwise use commit-object content or set `State: INCOMPLETE`.

Re-read the remote base and head immediately before synthesis. Recheck mutable contract sources. Any mismatch sets `State: STALE`; do not emit a prior clean conclusion. A pushed fix always changes the head and therefore requires a new attestation.

## Contract gate

Intent-sensitive blockers and exclusions need a named authoritative contract source. When sources disagree, reconcile them before filing the intent-sensitive concern as Action or excluding it from scope.

- Contract-independent security flaws, crashes, and data corruption remain fileable immediately.
- Unresolved intent is `contract-dependent`: record it as a review hold, not an Action finding.
- A `contract-dependent` hold prevents `PASSED` until an authoritative source resolves or explicitly excludes the behavior.

## Full coverage

`Coverage: full` requires dispositions for:

- Every in-scope diff hunk and file.
- Relevant callers, consumers, contracts, types, and tests found while tracing the change.
- Every requested lens.
- Every applicable boundary class and entrypoint.
- Every prior finding supplied for the same head that still falls inside the declared scope.

When behavior partitions across multiple input, state, transport, or lifecycle classes, enumerate the applicable rows and entrypoints before passing. Keep the matrix domain-neutral here; consumer guidance owns product-specific rows and expected outcomes.

## Finding identity

The labels are composable, not one exclusive enum:

| Label                  | Use                                                                                                    |
| ---------------------- | ------------------------------------------------------------------------------------------------------ |
| **new**                | No supplied prior finding has the same root cause.                                                     |
| **repeat**             | The same root cause remains or reappears. Consolidate it instead of filing a duplicate.                |
| **regression**         | Optional qualifier only when a proven content delta caused or worsened the behavior.                   |
| **contract-dependent** | Non-Action review hold for unresolved expected behavior.                                               |
| **CI-only**            | Separate workflow classification. Do not inspect, file, or use it to determine this code-quality gate. |

For reports from multiple lenses, synthesize only reports with the same bound identity. Merge findings by root cause and preserve distinct triggers inside the consolidated finding. Emit one attestation after all requested lenses finish. A later lens produces a new, broader attestation; it does not silently widen an earlier clean result.

## Pass predicate

Emit `State: PASSED` and exactly:

```text
No merge-blockers in scope.
```

only when all are true:

- The final remote base and head match the bound identity.
- The contract is frozen or reconciled and its recorded basis is current.
- Coverage is full for the declared scope, lenses, and boundary classes.
- No confirmed ship-blocker remains.
- No `contract-dependent` review hold remains.
- No review work or evidence request remains pending.

The signal means code review passed for the displayed snapshot, contract, and scope. It does not assert that the hosting platform currently permits merge.
