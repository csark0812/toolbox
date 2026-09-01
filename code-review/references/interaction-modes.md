# Code review interaction modes

<!-- source-of-truth: task-shaped mode router for code review. -->
<!-- doc-meta: owner=eng | last-reviewed=2026-09-01 -->

Choose one primary mode. Filing breadth is separate from mode selection.

## Focused check

Use when the user names one risk, question, behavior, or narrow lens.

- Trace only the evidence needed to settle the named question.
- Do not imply broad coverage.
- Widen only for a severe reachable defect found on the traced path. State why the scope widened.
- A clean result means no issue was found for that question in that scope.

## Standard review

Use for an ordinary diff, staged change, commit, branch, pull request, path, snapshot, or paste review.

- Review the bound surface for reachable defects.
- Use the named lens as the emphasis.
- Keep a light correctness and trust-boundary scan in the background.
- A clean result means no actionable finding was proved in the reviewed scope. It is not a merge attestation.

## Closure check

Use when the user asks whether a prior finding or fix is resolved.

- Re-run or reason through the original trigger.
- Inspect the original root cause and adjacent cases under the same invariant.
- Do not restart a full review.
- Return `fixed`, `not fixed`, or `inconclusive`.
- A different risk is a separate noted concern or a new requested review.

## Merge gate

Use only when the user asks whether a branch or pull request passes code review for merge.

- Read [merge-readiness.md](merge-readiness.md).
- Bind immutable remote identity and current contract evidence.
- Cover the full declared scope, lenses, and applicable behavior classes.
- Recheck freshness immediately before the final status.
- Only a current and complete `PASSED` result can emit `No merge-blockers in scope.`

## Filing breadth

- **Blockers only** is the default for every mode.
- **Improvements** adds hardening, cleanliness, test inventory, documentation, architecture, and polish when the user asks.
- Coverage depth and filing breadth are different choices. A thorough or exhaustive review does not automatically request improvement categories.
