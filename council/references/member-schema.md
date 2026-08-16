# Member report schema

<!-- doc-meta: owner=eng | last-reviewed=2026-08-16 -->

Default shape for member Task prompts when the coordinator will **synthesize multiple members** into one report.

**When `N = 1`:** use this schema only if the process skill does not specify output. When a process skill defines member output (second-opinion adversarial fields, probe verdict support), **that skill wins**.

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
