# Bug fix

<!-- source-of-truth: workflow playbook for a reported defect from reproduction to reviewed fix -->
<!-- doc-meta: owner=eng | last-reviewed=2026-10-15 -->

**You own** the defect from report to a reviewed, verified fix.

1. Reproduce and diagnose with evidence-based-debugging. Gate: the cause is demonstrated, not inferred.
2. Pin the defect with a failing regression test at a public seam using tdd, then make it pass. Gate: the test fails before the fix and passes after.
3. Fix the root cause, not the symptom. If two fixes on one assumption fail, write the assumption down and test it first.
4. Review the change with code-review in a focused mode on the touched paths.
5. Verify on the surface where the user saw the defect.

**Reply contract:** cause with its evidence level, the fix, the regression test, review outcome, and where the fix was verified.
