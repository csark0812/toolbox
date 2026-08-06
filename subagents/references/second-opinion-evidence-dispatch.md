# Second-opinion evidence dispatch (optional pre-wave)

<!-- doc-meta: owner=eng | last-reviewed=2026-08-06 -->

Optional **pre-wave** gather for large plans before [second-opinion-dispatch.md](second-opinion-dispatch.md). **Not** a substitute for staged debate.

## When

- Large plan / PRD / issue set with many cited primary sources
- Attackers/defender would lack path context without a coverage split first

## When to skip

- Small plan — go straight to [second-opinion-dispatch.md](second-opinion-dispatch.md)
- Dialogue without plan → **crystallize** / **grill**

## Members

| Slice                       | Prefer                                             | Fallback         |
| --------------------------- | -------------------------------------------------- | ---------------- |
| Premises + scope            | `generalPurpose` · stance `premises`               | Plan text only   |
| Dependencies + blast radius | `architecture` if available; else `generalPurpose` | agent-discovery  |
| Cited paths skim            | `explore`                                          | `generalPurpose` |

## Dispatch plan template

```markdown
Task: Second-opinion — parallel evidence for [plan path]
Classification: gather
Source of truth: plan
Goal: coverage
Parent model: [Auto | named]

Selected members:

- generalPurpose · tier=Standard · model=inherit-auto · stance=premises: premises + scope
- explore · tier=Fast · model=inherit-auto · stance=n/a: skim [cited paths]

Synthesis plan: merge into wave-2 defender context; then second-opinion-dispatch.md
```

Feed merged reports into wave 2 context pack only — **do not** skip debate.
