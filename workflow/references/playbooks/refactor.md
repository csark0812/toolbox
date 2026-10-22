# Refactor

<!-- source-of-truth: workflow playbook for a behavior-preserving structural change -->
<!-- doc-meta: owner=eng | last-reviewed=2026-10-22 -->

**You own** the structural change until the old path is gone and behavior is unchanged.

1. Run refactor-companion to agree the target design and slice the change.
2. Remove before adding. Migrate callers and delete the old path in the same wave.
3. Commit each slice only once the tests and acceptance check pass; never delete or weaken a test.
4. Review with code-review in strict quality-gate mode.

**Reply contract:** the target design, slices with proof per slice, removed paths, and the review outcome.
