# Second-opinion output

<!-- doc-meta: owner=eng | last-reviewed=2026-08-06 -->

Extends [output-schema.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/output-schema.md). Synthesis procedure → [plan-review.md](plan-review.md).

## Summary block (required on completion — user-facing)

After both debate waves, end with this block only for the user:

```markdown
## Second opinion summary

**Artifact:** [path or title]
**Bottom line:** [one short paragraph — design holds / holds with edits / reopen grill on X]

### Action items

- [concrete next step — or "None — ready to implement"]
```

Do **not** put Gaps, Risky assumptions, or Debate tags in the user-facing summary. Those stay coordinator-internal while synthesizing — not dumped after a run.

## Coordinator-internal notes (optional; not user-facing)

While synthesizing, the coordinator may privately track:

- What's solid / gaps / hidden dependencies / risky assumptions
- Debate tags (`attacker-convergent` | `defended` | `conceded` | `drift`)
- Axis / readiness survivors after defender rebuttal

Fold anything the user needs into **Bottom line** and **Action items** only. Omit empty internal notes — do not pad the user summary.
