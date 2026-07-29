# Escalation ladder

Primary-first by default. Council machinery is **opt-in / justified**, not automatic. Fit check from [`multi`](../multi/SKILL.md#fit-check) applies when escalating.

## Rungs

| Rung                     | When                                                                                                                   | Behavior                                                                              |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| **Primary**              | Default for Focused/Standard; first pass on Broad                                                                      | Coordinator reviews with tools; emit `Review · …` without Task members                |
| **Targeted specialists** | User asks for a named lens **or** primary logs unresolved domain after direct inspection                               | `multi`, Fit check ON, cap **3** matched specialists; primary validates before filing |
| **Council**              | User says `council` / `multi-agent` / `exhaustive council`; or multiple unresolved cross-cutting domains after primary | [council-dispatch.md](council-dispatch.md) + [synthesis.md](synthesis.md)             |

**Matched policy:** path/keyword match may select **who** to spawn, never **whether** to spawn. Broad surface may _consider_ specialists after primary deep pass; **never** spawn from size alone.

## Primary cannot settle (log before escalate)

Record in header or synthesis: domain boundary, what was inspected, why primary evidence is insufficient. Then escalate at most one rung.

## Council dispatch

When council or specialists run → [council-dispatch.md](council-dispatch.md). Depth budgets (Quick 1 / Standard 2 / Thorough 4 / Full 5) apply **only** on escalated runs — [agent-selection.md](agent-selection.md).

## Re-review

`closure-re-review` → primary targeted closure by default; see [surfaces.md](surfaces.md) § Re-review and [anti-thrash.md](anti-thrash.md). User-requested council on re-review uses this ladder.

## Forbidden

- Fabricating council member reports without completed Task runs.
- Skipping primary pass because the diff is docs/skills/small/single-theme.
- Auto Full×5 council from file/line thresholds on first baseline.
