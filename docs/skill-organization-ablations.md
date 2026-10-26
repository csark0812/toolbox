# Skill organization ablations

<!-- source-of-truth: interpreting live ablation runs that compare skill organization arms. -->
<!-- doc-meta: owner=eng -->

Does how skills are **organized** (routing, escalation, fit-check) change runtime behavior?

## Suite

`agent-suites/organization-ablations/` runs each arm three times (`comparisons` mode).

```bash
npm run agent:test:ablations
```

Runs on the Codex subscription configured in `agent-test.config.ts`. Compare runs under the **same model** and similar token budget.

## Arms

| Scenario                                  | Tests                 | Pass signal                                   |
| ----------------------------------------- | --------------------- | --------------------------------------------- |
| `ablation review: council escalation arm` | User requests council | Escalation via **council** path               |
| `ablation council: fit-check skip arm`    | Sequential repo map   | Names single-pass rival, skips parallel spawn |

## How to interpret

- **Council arm** must pass only when escalation criteria or an explicit user ask applies. It must not pass on every large diff.
- **Fit-check skip** must beat forced parallel spawn on single coherent repo slices.

If an arm fails live on a consistent basis while the other passes, open a skill patch via [skill-evolution.md](skill-evolution.md). Do not reorganize skills from one run.

See [evidence-parity.md](evidence-parity.md) for the full skill-on vs skill-off cadence and compare-report workflow.

## Not measured here

- Numeric SkillsBench scores
- Cross-model transfer (run ablations per model family separately)
- Consumer-specific council roster overlays (those live in consumer repos)
