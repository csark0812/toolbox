---
name: investigate
description: Settle one concrete hunch with primary-source evidence — verdict, not fix. Process skill; optional multi-member → subagents investigate-dispatch. Not written plan review (second-opinion), open ideation (crystallize), or repro→fix (diagnose).
---

# Investigate

**Source of truth for** evidence-based hunch verification — find and verdict only.

<!-- doc-meta: owner=eng | last-reviewed=2026-08-06 -->

**Process skill** — narrow target, ranked hypos, primary material, plain-language verdict. **Optional A2A** → [`subagents`](../subagents/SKILL.md) [investigate-dispatch.md](../subagents/references/investigate-dispatch.md) when broad/contested/multi-topic.

References: [framework.md](references/framework.md) · [output.md](references/output.md).

Read [research-basis.md](references/research-basis.md) only when calibrating evidence claims.

## Non-negotiables

1. **Verdict not fix** — no patches in verdict/evidence unless user asked to implement.
2. **Primary-source-first** — after target is clear, read actual code/docs/data.
3. **Citations required** — `file:line` for code; URL#section or quote for docs/web.
4. **Prefer no finding over speculation** — unfounded hunch → say so.

## Workflow

Follow [framework.md](references/framework.md):

1. **Narrow** — clarification chain until primary material is purposeful.
2. **Hypothesize** — 2–4 ranked falsifiable hypos.
3. **Discriminating checks** — cheapest kill tests before confirmatory forage.
4. **Primary material + forage or leave** — re-rank when signal dies.
5. **Verdict** — [output.md](references/output.md).

## Routing

| Situation                       | Skill / dispatch                                                                         |
| ------------------------------- | ---------------------------------------------------------------------------------------- |
| Plan on disk to critique        | **second-opinion**                                                                       |
| Fuzzy, no target                | **crystallize**                                                                          |
| Broad / contested / multi-topic | **subagents** [investigate-dispatch.md](../subagents/references/investigate-dispatch.md) |
| Repro-first bug after verdict   | **diagnose**                                                                             |

## Consumer bindings

Project-specific injected context appended on skill read. Do not edit synced copies in place.

## Output format

Follow [output-schema.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/output-schema.md). Details → [references/output.md](references/output.md).
