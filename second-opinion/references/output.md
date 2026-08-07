# Second-opinion output

<!-- doc-meta: owner=eng | last-reviewed=2026-08-07 -->

Extends [output-schema.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/output-schema.md). Synthesis procedure → [plan-review.md](plan-review.md).

## Summary block (required on completion — user-facing)

After the **selected cast** completes, end with this block only for the user. User-facing blocks must use pragmatic STE. See [docs/skill-evolution.md](../../docs/skill-evolution.md) § Pragmatic STE for toolbox, or `/simple-english`.

```markdown
## Second opinion summary

**Artifact:** [path or title]
**Cast:** [full | light · premises|completeness · defend|no-defend]
**Bottom line:** [one short STE paragraph — design holds / holds with edits / reopen grill on X]

### Action items

- [concrete next step — or "None — ready to implement"]
```

**Artifact** is a disk path or a short title for an in-thread paste/draft. **Cast** names what ran so light vs full is visible without dumping debate tags.

Do **not** put Gaps, Risky assumptions, or Debate tags in the user-facing summary. Those stay coordinator-internal while synthesizing — not dumped after a run.

## Coordinator-internal notes (optional; not user-facing)

While synthesizing, the coordinator can privately track:

- What is solid / gaps / hidden dependencies / risky assumptions
- Debate tags (`attacker-convergent` | `defended` | `conceded` | `drift`)
- Axis / readiness survivors after defender rebuttal (when defender ran)

Fold anything the user needs into **Bottom line** and **Action items** only. Omit empty internal notes — do not pad the user summary.
