# Second-opinion evidence dispatch (optional pre-wave)

<!-- doc-meta: owner=eng | last-reviewed=2026-08-10 -->

Optional **pre-wave** gather for large artifacts before [second-opinion-dispatch.md](second-opinion-dispatch.md). **Not** a substitute for staged debate. **Deep only** — skip for light and med.

## When

- Large plan / PRD / issue set with many cited primary sources
- **Deep** run where defender would lack path context without a coverage split first

## When to skip

- Light or med depth — go straight to [second-opinion-dispatch.md](second-opinion-dispatch.md) or coordinator-only (light)
- Small artifact — go straight to dispatch
- Dialogue without artifact → stop; need **Artifact** path (see second-opinion entry gate)

## Members

| Slice                       | Prefer                                             | Fallback         |
| --------------------------- | -------------------------------------------------- | ---------------- |
| Scope + cited paths skim    | `explore`                                          | `generalPurpose` |
| Dependencies + blast radius | `architecture` if available; else `generalPurpose` | agent-discovery  |

Coordinator assigns slices from invented lenses — not a fixed premises/completeness split.

## Dispatch plan template

```markdown
Task: Second-opinion — parallel evidence for [artifact path]
Classification: gather
Source of truth: artifact
Goal: coverage
Depth: deep (pre-wave only)
Parent model: [Auto | named]

Selected members:

- explore · tier=Fast · model=inherit-auto · stance=n/a: skim [cited paths]
- generalPurpose · tier=Standard · model=inherit-auto · lens=[invented]: [one-line gather mandate]

Synthesis plan: merge into wave-2 defender context; then second-opinion-dispatch.md (deep)
```

Feed merged reports into wave 2 context pack only — **do not** skip debate.
