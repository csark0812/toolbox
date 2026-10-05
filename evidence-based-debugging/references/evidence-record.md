# Evidence record and reporting

<!-- doc-meta: owner=eng | last-reviewed=2026-10-05 -->

Keep only the state needed to choose the next experiment and explain the result. Maintain it in conversation for short investigations. Persist a small record when duration or handoff makes continuity useful, using the consumer's artifact convention or a temporary location. Do not create a permanent repository document by default.

| Field        | Content                                                             |
| ------------ | ------------------------------------------------------------------- |
| Failure      | Expected behavior, actual behavior, trigger and affected surface    |
| Baseline     | Relevant revision, environment, configuration and input             |
| Authority    | Diagnosis or authorized repair; boundaries on experiments           |
| Observations | Source locations or captured artifact pointers and what they show   |
| Hypotheses   | Competing mechanisms, predicted observations and falsifiers         |
| Experiments  | Conditions, commands/actions, results and interpretation            |
| Conclusion   | Demonstrated, supported or unresolved cause, including contributors |
| Verification | Mechanism and affected-surface results, with unavailable boundaries |
| Next check   | The next discriminating action or specific missing evidence         |

Preserve contradictory results and provenance. Changes to revision, inputs or conditions may invalidate earlier conclusions; identify the evidence that needs rechecking. Do not overwrite the original failure with the repaired result.

## Final report

Use the smallest shape that conveys the outcome; omit empty sections. A short paragraph is sufficient for a simple diagnosis.

```markdown
**Result:** [demonstrated diagnosis, supported explanation, unresolved issue, or repair with its verification boundary]

**Failure and reproduction:** [expected/actual behavior; reproduced, intermittent or captured only; relevant revision/environment]

**Cause and evidence:** [causal chain and cited checks; separate remaining hypotheses]

**Repair:** [what changed and why, when authorized]

**Verification:** [checks actually run and results; trials for intermittent behavior; mechanism and affected-surface proof separately]

**Remaining uncertainty / next action:** [specific pending observation or original-environment verification]
```

For an unresolved issue, summarize attempts and the smallest missing observation that would change the conclusion. For a repair based on captured evidence, state explicitly if the original environment remains unverified. Cleanup and regression protection belong in the verification account when applicable.
