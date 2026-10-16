# Bug fix

<!-- source-of-truth: workflow playbook for a reported defect from reproduction to reviewed fix -->
<!-- doc-meta: owner=eng | last-reviewed=2026-10-15 -->

**You own** the reported defect from report to a reviewed, verified fix, and nothing beyond it.

1. Reproduce and diagnose with evidence-based-debugging. Gate: the cause is demonstrated with captured output, such as a failing test or a direct call at the failing input, not inferred from reading code.
2. Pin the defect with a failing regression test at a public seam using tdd, then make it pass. If an existing test already pins it, say so and use it. Gate: the same check fails before the fix and passes after, and you keep both outputs.
3. Fix the root cause, not the symptom. If two fixes on one assumption fail, write the assumption down and test it first.
4. Check scope before review. Search for sibling uses of the changed code or condition, and read the full diff, not only its stat. Fix siblings that are the same defect, and any bug in the same code path that would leave the reported behavior wrong. Report any other bug you find, with its location, and leave it unfixed.
5. Review the change with code-review in a focused mode on the touched paths.
6. Verify on the surface where the user saw the defect, after your last edit: rerun the tests and the original reproduction, and keep both outputs.

**Reply contract:**

- Cause with its evidence level.
- The failing → passing output of the check from step 2, quoted briefly.
- The fix.
- What the scope check searched and found, and any adjacent bugs left unfixed.
- The review outcome.
- Where the fix was verified.
