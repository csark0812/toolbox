---
name: multi
description: Parallel subagent orchestration kernel — spawn invariants, model routing, generic prompts and synthesis. Entry skills supply job recipes (explore, research, council review, …). Use when a task splits into independent slices and parallel work improves coverage, speed, or confidence.
---

# Multi

**Source of truth for** parallel subagent orchestration.

<!-- doc-meta: owner=eng | last-reviewed=2026-07-13 -->

Parallel independent subagents via the host **Task** tool (Cursor: **Subagent**). **Orchestration kernel only** — entry skills own job recipes and domain-specific synthesis.

## When to Use

- Task splits into 2+ independent slices (explore, research, gather, council dispatch)
- Parallel work improves coverage, speed, or confidence

Skip when: one agent suffices, work is sequential, or user wants a single pass — see [Fit check](#fit-check).

## Quick reference

| Need                         | Where                                                          |
| ---------------------------- | -------------------------------------------------------------- |
| Must-spawn invariants        | [Non-negotiables](#non-negotiables)                            |
| Generic task prompt          | [references/task-prompt.md](references/task-prompt.md)         |
| Per-member output shape      | [references/member-schema.md](references/member-schema.md)     |
| Generic consolidated report  | [references/output-format.md](references/output-format.md)     |
| Agent discovery (mechanical) | [references/agent-discovery.md](references/agent-discovery.md) |

## Non-negotiables

When this skill applies (user attached `multi`, an entry skill invokes parallel dispatch, or the plan chose `N ≥ 2` members):

1. **Spawn real members** — Use the host **Task** tool once per planned member with chosen `subagent_type` and model per [Model assignment](#model-assignment). Parallel `read_file` / `grep` / other tools are **not** substitutes for member runs.
2. **Synthesis runs after members** — The [synthesis gate](#synthesis-gate) merges member outputs. Writing a consolidated report **without** running those `Task` calls first is a **violation**, not an optimization.
3. **Forbidden rationalizations** — Do not skip spawns because you already read the repo, expect overlapping findings, want lower latency, or want to save tokens.
4. **Valid skips** — Omit parallel spawns only when: the user declines or asks for a single pass; the job matches [Fit check](#fit-check); the host cannot run `Task`; or only one member was planned.

**Model routing:** Apply [Model assignment](#model-assignment) per member. Parent on Auto → inherit Auto unless the user named a model. Parent not on Auto → set explicit `model` slugs. On usage-limit start/stop failures → [Usage-limit retry](#usage-limit-retry).

## Fit check

**Use multi** when members are independent and parallel work improves coverage, speed, or confidence — e.g. multi-source gathering, broad exploration, orthogonal research topics, or mixed gather passes.

**Skip multi** when the task fits one agent, work is sequential, members would duplicate without adding confidence, or the user wants a single authoritative pass.

## Dispatch modes

- **Coverage** — Split by source, subsystem, domain, or artifact. Example: one member maps data flow, another maps call sites.
- **Perspective** — Same material, distinct stance. Model diversity alone is not enough if prompts are identical.

**Hard rule:** Never run parallel members with identical model plus identical prompt. When all members inherit Auto, diversify via distinct prompts and/or stances — shared Auto is expected.

## Workflow

### 1. Classify

Load the entry skill's recipe when one applies; otherwise plan manually:

- Job type: `research` | `explore` | `gather` | `mixed`
- Source of truth: `web` | `repo` | `plan`
- Goal: coverage | perspectives | both
- Independence: if members need each other's output, this is sequential — do not use `multi`

### 2. Plan and spawn

1. **Discover** — [agent-discovery.md](references/agent-discovery.md) when council agents may apply; otherwise pick host built-in `subagent_type` values directly.
2. **Dispatch plan** — write before spawning:

```markdown
Task: [What the user asked]
Classification: [research / explore / gather / mixed]
Source of truth: [web / repo / plan]
Goal: [coverage / perspectives / both]

Parent model: [Auto | <named model>]
Selected members:

- [subagent_type] · tier=[Fast|Standard|Premium] · model=[inherit-auto | slug] · stance=[id or n/a]: [sub-task and expected output]
- [subagent_type] · tier=[Fast|Standard|Premium] · model=[inherit-auto | slug] · stance=[id or n/a]: [sub-task and expected output]

Why these members: [brief justification]
Synthesis plan: [how outputs will be merged or adjudicated]
```

3. **Spawn** — one Task per member in parallel. Compose prompts per [task-prompt.md](references/task-prompt.md). Set or omit `model` per [Model assignment](#model-assignment). On usage-limit failures → [Usage-limit retry](#usage-limit-retry).

Member planning defaults:

- Research → one member per independent topic
- Exploration → one member per area, subsystem, or artifact type
- Gathering → one member per source of truth or coverage lens
- Mixed → combine roles only when slices stay independent

### 3. Synthesize

Apply the [synthesis gate](#synthesis-gate).

## Synthesis gate

**Prerequisite:** At least one completed `Task` per planned member (unless valid skips above apply). If no members ran, do not fabricate a multi report.

After members return:

1. Merge findings that agree; state once with the highest shared confidence.
2. Preserve conflicts — do not flatten disagreements.
3. High-stakes contradiction → Premium tiebreaker Task or escalate to the user.
4. Write one consolidated report per [output-format.md](references/output-format.md).

Domain-specific synthesis (review filing, investigate verdicts, second-opinion sections) → entry skill recipe.

## Fallback matrix

When council agents are unavailable or the job uses host built-ins only:

| Need                    | Prefer                    | Fallback                                                         |
| ----------------------- | ------------------------- | ---------------------------------------------------------------- |
| Repo map                | `explore`                 | `generalPurpose`                                                 |
| Web research            | `docs-researcher`         | `generalPurpose`                                                 |
| Plan structure critique | `generalPurpose` + stance | council agent if in HOST and `dispatch.contexts` includes `plan` |

Log skipped council agents and chosen fallbacks in the [availability log](references/agent-discovery.md#availability-log-required-in-dispatch-plan).

## Model assignment

Use the Task tool's allowed `model` enum from the current host. Never invent slugs.

### Parent-aware routing

Detect whether the **parent chat** is on host **Auto** (auto model selection) or a **named** model.

| Parent                          | Initial member `model`                                                            | Notes                                                                              |
| ------------------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| **Auto**                        | **Omit** `model` (inherit parent Auto)                                            | Do **not** pass explicit paid/API slugs. User-named model for a member still wins. |
| **Named** (not Auto)            | Set explicit `model` per [Explicit routing](#explicit-routing-parent-not-on-auto) | Use tier → slug tables below.                                                      |
| User named a model for a member | That slug (must be in enum)                                                       | Overrides both Auto inherit and tier defaults.                                     |

**How to inherit Auto on Task:** Prefer **omitting** `model` so the host inherits the parent. Pass `model=auto` only if the current host Task enum accepts it; do not invent `auto` when it is not in the enum.

Record `Parent model: Auto | <named>` in the dispatch plan. When inheriting, log `model=inherit-auto`.

A dedicated routing table for informed per-slice model choice may replace or refine [Explicit routing](#explicit-routing-parent-not-on-auto) later — until then, use the tier tables below when the parent is not on Auto.

### Explicit routing (parent not on Auto)

**Routing priority:** (1) **Composer 2.5** (`composer-2.5-fast`) for Standard-tier slices when in the enum. (2) **Cheapest** enum slugs for Fast/mechanical work. (3) **Premium** slugs only when the slice needs heavy reasoning.

#### Tiers

| Tier         | Slice needs                                                                         | Preferred slug                                   | Escalate when                                            |
| ------------ | ----------------------------------------------------------------------------------- | ------------------------------------------------ | -------------------------------------------------------- |
| **Fast**     | Mechanical search, file discovery, repo mapping, narrow gather                      | Cheapest slug in enum                            | Cross-file integration or judgment calls needed          |
| **Standard** | Moderate reasoning, explore follow-ups, web research                                | `composer-2.5-fast` when present; else mid slugs | High-stakes contradictions or user asks for deepest pass |
| **Premium**  | Architecture blast radius, synthesis tiebreakers, explicit deepest-analysis request | Deepest slug in enum                             | —                                                        |

**Pick a slug:** (1) User named a model in enum → use it. (2) Classify enum values into Fast / Standard / Premium. (3) Choose the **lowest** tier that fits. (4) Standard → `composer-2.5-fast` first.

#### By job type

| Job                  | Default tier | Preferred slug      | Escalate when                                    |
| -------------------- | ------------ | ------------------- | ------------------------------------------------ |
| `explore` / `gather` | Fast         | Cheapest in enum    | Cross-file integration or architectural judgment |
| `research` (web)     | Standard     | `composer-2.5-fast` | Conflicting sources or policy/legal ambiguity    |
| `mixed`              | Per slice    | Per tier table      | —                                                |

Per-agent tier defaults → agent dispatch config + judgment above.

#### Diversity

If `N ≥ 2` parallel members share the same `subagent_type` and the parent is **not** on Auto, assign distinct models **within the same tier** unless the user wants uniformity or the host has only one viable model. **Do not escalate tier just to diversify.** When the parent is on Auto, skip model diversity — diversify prompts/stances instead.

### Usage-limit retry

If a member **could not start**, was **stopped**, or returned an error because of **usage limits**, **rate limits**, or **quota exhaustion** on the chosen model:

1. Retry that **same** member once with host Auto: omit `model` (or `model=auto` only if the enum accepts it).
2. Keep the same `subagent_type`, prompt, and stance.
3. Apply whether the failure came from the Task tool (pre-start) or from the member after start.
4. Log the retry in the dispatch plan (`retried with inherit-auto — usage/rate limit`).
5. If the Auto retry also fails, document the failure and continue with remaining members — do not invent that member's output.

## Agent count

| Scope  | Count | When                                        |
| ------ | ----- | ------------------------------------------- |
| Small  | 2–3   | Focused feature, explore + verify           |
| Medium | 4–6   | Multiple related areas or mixed gather      |
| Large  | 7–10  | Broad exploration or comprehensive research |

More than 10 members — split into multiple `multi` runs.

## Limitations

- 10 member maximum
- Members work independently; no inter-member communication
- Best for parallel independent work, not sequential workflows
- Startup overhead makes it wasteful for tiny tasks

## Output format

Follow [references/output-schema.md](references/output-schema.md). Consolidated runs use [references/output-format.md](references/output-format.md).

## Consumer bindings

Project recipe index and council agent paths arrive as project-specific injected context on skill read. Do not edit synced copies in place.
