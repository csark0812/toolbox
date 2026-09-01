# Persona member prompt

<!-- source-of-truth: minimum prompt contract for one council task persona. -->
<!-- doc-meta: owner=eng | last-reviewed=2026-09-01 -->

Give every member the same task facts and success criteria. Add only that member's persona card and needed sources.

```markdown
Task: [concrete task]
Success: [what a useful answer must decide, change, or make clear]

Persona: [task-specific name]
Purpose: [decision risk that this persona protects]
Question: [one owned question]
Evidence: [paths, sources, or evaluation rules]
Falsifier: [finding that changes or defeats the expected view]
Boundary: [work owned by another persona]

Return:

- Answer to the owned question
- Evidence
- Material uncertainty
- Recommendation

Constraints:

- Work independently during the first round.
- Do not assume sibling conclusions.
- Stay inside the persona boundary.
```

If a layered process skill defines a stronger member output, use that output instead.
