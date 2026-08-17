# Code review research basis

<!-- source-of-truth: evidence behind review filing and evidence bar. -->
<!-- doc-meta: owner=eng | last-reviewed=2026-08-07 -->

Read when calibrating filing density or evidence claims. Not for every review.

## Merge-blockers-only filing

Reduces speculative noise — file reachable production defects, not test inventory or polish by default.

**Confidence:** High for maintainability. Moderate for cold-start agent success.

## Introduced-only default

Review what the diff changed or newly exposed. Pre-existing issues belong in Noted unless they block the changed path.

**Confidence:** Moderate — reduces scope creep on large diffs.

## Evidence over volume

Each Action item needs `path:line`, trigger, and impact. Prefer no finding over speculation.

**Confidence:** High as process hygiene.
