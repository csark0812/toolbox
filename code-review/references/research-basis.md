# Code review research basis

**Source of truth for** evidence and limits behind primary-first review.

<!-- doc-meta: owner=eng | last-reviewed=2026-07-29 -->

Read when calibrating surface bands, filing density, or claiming review-process benefits. Not for every review pass.

## Evidence posture

- Large changesets tend toward lower usefulness density per comment — depth beats volume on Broad surfaces.
- Primary-first matches equal-budget findings that multi-agent review is often extra tokens, not extra signal.
- Merge-blockers-only filing reduces speculative noise.

## Usefulness density (Broad)

As file count in a changeset rises, proportion of useful review comments tends to drop — reviewers skim or ask clarifying questions instead of deep reads.

**Confidence:** Moderate to high for human review at scale; moderate for LLM primary review mimicking the same constraint.

**Does not transfer:** Hard file-count gates; skipping review on large PRs.

- Bosu, A., Greiler, M., & Bird, C. (2015). _Characteristics of Useful Code Reviews: An Empirical Study at Microsoft._ MSR. https://doi.org/10.1109/MSR.2015.21
- Google eng practices — small CLs: https://google.github.io/eng-practices/review/developer/cl-small.html

## Primary-first vs council

Default one coordinator with direct diff inspection; escalate specialists only on user ask or unresolved domain after primary pass.

**Confidence:** Moderate for cost and debuggability; aligns with budget-normalized single-agent reasoning literature.

**Does not transfer:** Mandatory council on every large diff; size alone as escalation trigger.

- Han et al. (2025) and related work on equal thinking-token budgets — multi-agent overhead without guaranteed lift.
