# Grill research basis

**Source of truth for** evidence and limits behind design-tree alignment.

<!-- doc-meta: owner=eng | last-reviewed=2026-07-29 -->

Read when calibrating falsifiers, silent-topic scan, or making a research claim. Not for every grill session.

## Evidence posture

- Design trees explore branches; premature aggregation before falsifiers invites false alignment.
- Consider-the-opposite is a debiasing move, not proof the rejected branch was wrong.
- Human owns decisions; agent owns repo-lookupable facts.

## Consider-the-opposite / falsifier

Before leaving a decision node, state what would show the chosen branch was the wrong bet. Silence is not acceptance.

**Confidence:** Moderate to high as debiasing hygiene; low as guarantee of optimal design.

**Does not transfer:** Scored tree search (MCTS/beam) — grill is dialogue with a human branch chooser, not automated search.

- Lord, C. G., Lepper, M. R., & Preston, E. (1984). Considering the opposite: A corrective strategy for social judgment. _Journal of Personality and Social Psychology._
- Yao et al. (2023). Tree of Thoughts — exploration with aggregation; grill borrows branch thinking without formal scoring.

## Silent-topic scan

Failure modes, rollback, ownership, constraints, and NFR tradeoffs must be decided or explicitly marked in/out of scope — prevents “aligned” summaries that skipped unhappy paths.

**Confidence:** Moderate — process gate; not validated as a completeness oracle.

**Does not transfer:** Exhaustive enterprise architecture review checklists in one grill pass.
