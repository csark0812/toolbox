# Code review output

<!-- source-of-truth: proportional user-facing output for each code review mode. -->
<!-- doc-meta: owner=eng | last-reviewed=2026-09-01 -->

Lead with the verdict or highest-severity finding. Use pragmatic Simple English. Omit empty sections and do not repeat findings in a synthesis.

Show one compact source line when it helps establish scope:

```markdown
Source: staged changes · `src/auth.ts` · lens: session expiry
```

Do not require approximate line counts, adapter labels, filing labels, or a process preamble in ordinary reviews.

## Focused check

Clean:

```markdown
No issue found for [question] in [scope].
```

Otherwise show the finding or uncertainty directly.

## Standard review

Clean:

```markdown
No actionable findings in the reviewed scope.
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
## [merge-blocker] Reject malformed absolute targets

`src/target.ts:24` · High

[Starting state and trigger.] [Wrong outcome and concrete impact.]
```

Add one short evidence sentence when the counter-evidence check is not obvious. Use severity only when it helps prioritize multiple findings.

For merge-gate outputs, every finding should be tagged as one of:

- `merge-blocker`
- `glaring-issue`
- `advisory`

If advisory exists, keep it in its own section and do not use it in the merge verdict.

```markdown
## Advisory: split ownership for async state transitions

`src/form.tsx:9`

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
