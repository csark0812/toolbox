# Parallel Gather

**Opt-in soft-default recipe:** Full Linear / `docs/prds/` baseline for consumers with **no** planning remap. Consumers that remap via customize (`shared-agent-references` / docs) must **not** use this file — open the consumer planning SSOT instead.

Multi-source collection from independent sources of truth. Uses [`subagents`](../../../../subagents/SKILL.md) kernel — [non-negotiables](../../../../subagents/SKILL.md#non-negotiables), [task-prompt.md](../../../../subagents/references/task-prompt.md), [member-schema.md](../../../../subagents/references/member-schema.md).

Profile: `manual` or `repo` (web topics → `research` via [investigate-dispatch.md](../../../../subagents/references/investigate-dispatch.md) § Parallel research).

## When to use

- Need facts from **multiple independent sources** (repo areas, doc hubs, config files) without overlap
- Planning step requires collecting constraints from separate SSOT files before synthesis
- User asks to "gather" context across domains in parallel

## When to skip

- Single file or hub already in context — read directly
- Blast-radius mapping across subsystems — use [parallel-explore.md](parallel-explore.md)
- Independent web topics — use [investigate-dispatch.md](../../../../subagents/references/investigate-dispatch.md) § Parallel research

## Members (2–4)

Split by **source of truth**, not perspective:

| Slice             | Subagent  | Tier | Example                                  |
| ----------------- | --------- | ---- | ---------------------------------------- |
| Doc / policy SSOT | `explore` | Fast | consumer validation / SSOT registry docs |
| Code area A       | `explore` | Fast | service / domain package paths           |
| Code area B       | `explore` | Fast | client data layer paths                  |

Each member collects from its slice only — no cross-slice inference until synthesis.

## Dispatch plan template

```markdown
Task: [gather goal — e.g. "collect auth + validation constraints for MCP change"]
Classification: gather
Source of truth: repo
Goal: coverage
Parent model: [Auto | <named model>]
User model overrides: [none | member=slug, …]

Selected members:

- explore · tier=Fast · model=[inherit-auto | slug] · stance=n/a: [doc/policy slice]
- explore · tier=Fast · model=[inherit-auto | slug] · stance=n/a: [backend slice]

Why these members: independent sources; no cross-member dependencies
Synthesis plan: merge fact lists; flag conflicts between sources
```

Compose prompts per [task-prompt.md](../../../../subagents/references/task-prompt.md).

## Synthesis

1. Merge non-overlapping facts per source.
2. Surface **conflicts** between sources (two SSOTs disagree).
3. Preserve source attribution (path per fact).
4. Output → [subagents output-format.md](../../../../subagents/references/output-format.md).

## Handoff

- Planning continues in **build** / **grill** / **second-opinion** with gathered facts.
- Does not produce verdicts — use **investigate** after gather if a specific doubt remains.
