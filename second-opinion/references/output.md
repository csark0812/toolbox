# Second-opinion output

<!-- doc-meta: owner=eng | last-reviewed=2026-08-16 -->

Extends [output-schema.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/output-schema.md). Synthesis procedure → [plan-review.md](plan-review.md).

## Summary block (required on completion — user-facing)

After the run completes, end with this block only for the user:

```markdown
## Second opinion summary

**Artifact:** [path or title]
**Mode:** [single-pass | council]
**Lenses:** [invented kebab-case lenses]
**Bottom line:** [one short paragraph — design holds / holds with edits / reopen grill on X]

### Action items

- [concrete next step — or "None — ready to implement"]
```

**Artifact** is a disk path or a short title for an in-thread paste/draft. **Mode** is `single-pass` when this skill ran alone, `council` when layered with council.

Do **not** put Gaps, Risky assumptions, or Debate tags in the user-facing summary. Those stay coordinator-internal while synthesizing — not dumped after a run.

## Coordinator-internal notes (optional; not user-facing)

While synthesizing, the coordinator may privately track:

- What's solid / gaps / hidden dependencies / risky assumptions
- Debate tags when council ran (`attacker-convergent` | `defended` | `conceded` | `drift`)

Fold anything the user needs into **Bottom line** and **Action items** only. Omit empty internal notes — do not pad the user summary.
