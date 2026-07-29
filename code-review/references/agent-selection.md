# Agent selection (escalated council only)

Discover and score council agents when [escalation.md](escalation.md) triggers specialists or council. **Primary-only reviews do not run this doc.**

Mechanical discovery → [multi agent-discovery.md](../../multi/references/agent-discovery.md). Kernel → [`multi`](../../multi/SKILL.md).

## Input

| Field   | Source                                  |
| ------- | --------------------------------------- |
| Profile | `review`                                |
| Scoring | diff paths, keywords, escalated depth   |
| Budget  | table below — **only after escalation** |
| Paths   | diff stat / name-only / explicit list   |
| Text    | diff body                               |

Surface band → [surfaces.md](surfaces.md) guides primary intensity, not this budget.

## Escalated depth budgets

Depth ranks: `quick` < `standard` < `thorough` < `full`.

| Depth    | Member budget | Typical use                                                     |
| -------- | ------------- | --------------------------------------------------------------- |
| Quick    | 1             | Single hotspot on re-review; primary could not settle one theme |
| Standard | 2             | Targeted specialists (cap 3 with Fit check — prefer Standard 2) |
| Thorough | 4             | User-requested deep council on cross-cutting surface            |
| Full     | 5             | Explicit council / exhaustive council / unresolved multi-domain |

`Spawn count = |SELECTED|`. Every SELECTED agent gets one Task ([council-dispatch.md](council-dispatch.md)).

## Selection algorithm

Run [agent-discovery](../../multi/references/agent-discovery.md) steps 1–2, then:

```
3. PROFILE ← review
4. AVAILABLE ← agents where review ∈ dispatch.contexts
5. PATHS, TEXT from diff
6. REQUIRED ← agents per path_trigger / required_from at escalated depth
7. BUDGET ← max(depth_budget[depth], |REQUIRED|)
8. SCORE optional agents; SELECTED ← REQUIRED ∪ top_scored(optional, BUDGET − |REQUIRED|)
9. Cap at 3 for targeted specialists unless user explicitly requested full council
```

Path match selects **who**, not **whether** — [escalation.md](escalation.md).

## Availability log

Record in dispatch plan per [agent-discovery § Availability log](../../multi/references/agent-discovery.md#availability-log-required-in-dispatch-plan).

## Integration

Task prompts → [task-prompt-review.md](task-prompt-review.md). Synthesis → [synthesis.md](synthesis.md) → [output.md](output.md).
