# Refactor companion output

<!-- source-of-truth: compact user-facing slice and completion reports. -->
<!-- doc-meta: owner=eng | last-reviewed=2026-09-03 -->

Use pragmatic Simple English. Show the delta, not the full internal record.

## After a normal slice

```markdown
Changed: [what changed, with clickable file-and-line links]
Proof: [what passed, what it proves, and any limit, with clickable evidence links]
Next: [next slice or decision]
```

Add `Decision`, `Residue`, or `Limit` only when material.

## At completion

```markdown
## Refactor result

Outcome: [target design now present]
Changed: [main ownership or boundary change, with clickable file-and-line links]
Residue: [removed, or retained for a named reason, with clickable evidence links]
Proof: [tests, searches, runtime evidence, and limits, with clickable evidence links]
Next: [walkthrough, formal review, or no further action]
```

Do not claim merge readiness. Offer optional follow-up work only when the relevant process is available.
