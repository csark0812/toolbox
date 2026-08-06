# Member report schema

Default shape for member Task prompts when the coordinator will **synthesize multiple members** into one report.

**When `N = 1`:** use this schema only if the entry skill does not specify output (e.g. generic explore gather). When an entry skill defines output (iterate blind pass, second-opinion debate member fields, probe verdict support), **entry skill output wins**.

```markdown
## Scope

[What this member evaluated]

## Assumptions

[Brief, or "none"]

## Findings

- [Concrete items with file/path refs when relevant]

## Dissent / alternatives

[Disagreement with an obvious fix or competing framing, or "none"]

## Confidence

[High / medium / low per major theme]

## Open questions

[Or "none"]
```

Adversarial overlays → [adversarial.md](adversarial.md) § Adversarial member fields.
