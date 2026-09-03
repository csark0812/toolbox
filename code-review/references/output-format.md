# Code review output

<!-- source-of-truth: proportional user-facing output for each code review mode. -->
<!-- doc-meta: owner=eng | last-reviewed=2026-09-01 -->

Lead with the verdict or highest-severity finding. Use pragmatic Simple English. Omit empty sections and do not repeat findings in a synthesis.

For ordinary reviews, use this order:

```markdown
## Review result

Verdict: [result] · [finding count and severity when needed]
Review limit: [only when a material check or boundary limits confidence]

### [severity] · _[finding title]_

[Trigger, wrong outcome, and impact.]

Evidence:

- [Proof point with inline links to relevant files and lines.]
- [Additional proof point when needed.]

Fix direction: [one concise repair direction.]
```

Put severity and the finding title on one heading line. Link files in the sentences they support, like citations; do not add a separate location block. Use `Fix direction` bullets only when the repair has multiple concrete actions. Keep review-wide limits beside the verdict, not inside a finding. Do not repeat source, lens, or merge-gate metadata in ordinary reviews.

## Focused check

Clean:

```markdown
## Review result

Verdict: No actionable findings
```

Otherwise show the finding or uncertainty directly.

## Standard review

Clean:

```markdown
## Review result

Verdict: No actionable findings
```

When findings exist, list them by severity. Add advisory findings only when requested.

## Closure check

```markdown
Verdict: fixed | not fixed | inconclusive
Checked: [original trigger and adjacent same-invariant cases]
Evidence: [decisive source or proof]
Next proof: [only when inconclusive]
```

## Action finding

```markdown
## High · _Reject malformed absolute targets_

[Trigger, wrong outcome, and concrete impact.]

Evidence:

- [Proof point with an inline link to `src/target.ts:24`.]

Fix direction: [one concise repair direction.]
```

Use `Evidence` bullets when there is more than one proof point. Inline file links in the relevant sentences. Use severity when it helps prioritize multiple findings.

For merge-gate outputs, every finding should be tagged as one of:

- `merge-blocker`
- `glaring-issue`
- `advisory`

If advisory exists, keep it in its own section and do not use it in the merge verdict.

```markdown
## Advisory · _Split ownership for async state transitions_

[Inline link to `src/form.tsx:9`]

[Useful follow-up with explicit trigger and rationale for follow-up value.]
```

## Uncertainty or contract hold

```markdown
Uncertainty: [unproved trigger or impact]
Next proof: [smallest read, test, or reproduction]
```

```markdown
Contract hold: [behavior whose expected result is unresolved] · [conflicting or missing sources]
```

## Merge gate

Use the compact attestation in [merge-readiness.md](merge-readiness.md). The exact clean signal belongs only to a current, complete `PASSED` merge gate.
