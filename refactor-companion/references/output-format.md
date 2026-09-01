# Refactor companion output

<!-- source-of-truth: compact user-facing slice and completion reports. -->
<!-- doc-meta: owner=eng | last-reviewed=2026-09-01 -->

Use pragmatic Simple English. Show the delta, not the full internal record.

## After a normal slice

```markdown
Changed: [what changed]
Proof: [what passed, what it proves, and any limit]
Next: [next slice or decision]
```

Add `Decision`, `Residue`, or `Limit` only when material.

## At completion

```markdown
## Refactor result

Outcome: [target design now present]
Changed: [main ownership or boundary change]
Residue: [removed, or retained for a named reason]
Proof: [tests, searches, runtime evidence, and limits]
Next: [walkthrough, formal review, or no further action]
```

Do not claim merge readiness. Offer optional follow-up work only when the relevant process is available.
