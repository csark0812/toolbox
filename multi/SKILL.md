---
name: multi
description: Parallel subagent orchestration kernel — spawn invariants, model routing, generic prompts and synthesis. Entry skills supply job recipes. Use when a task splits into independent slices and parallel work improves coverage, speed, or confidence.
---

# Multi

**Source of truth for** parallel subagent orchestration.

<!-- doc-meta: owner=eng | last-reviewed=2026-07-29 -->

Parallel independent subagents via the host **Task** tool (Cursor: **Subagent**). **Orchestration kernel only** — entry skills own job recipes and domain-specific synthesis.

## Quick reference

| Need                         | Where                                                          |
| ---------------------------- | -------------------------------------------------------------- |
| Must-spawn invariants        | [Non-negotiables](#non-negotiables)                            |
| Model routing (cost + fit)   | [references/model-routing.md](references/model-routing.md)     |
| Adversarial / staged debate  | [references/adversarial.md](references/adversarial.md)         |
| Generic task prompt          | [references/task-prompt.md](references/task-prompt.md)         |
| Per-member output shape      | [references/member-schema.md](references/member-schema.md)     |
| Generic consolidated report  | [references/output-format.md](references/output-format.md)     |
| Agent discovery (mechanical) | [references/agent-discovery.md](references/agent-discovery.md) |
| Research basis (calibration) | [references/research-basis.md](references/research-basis.md)   |

Read research basis when calibrating a move or making a research claim. Do not load by habit.

## Non-negotiables

When this skill applies (user attached `multi`, an entry skill invokes parallel dispatch, or the plan chose `N ≥ 2` members):

1. **Spawn real members** — Use the host **Task** tool once per planned member with chosen `subagent_type` and model per [Model assignment](#model-assignment). Parallel `read_file` / `grep` / other tools are **not** substitutes for member runs.
2. **Synthesis runs after members** — The [synthesis gate](#synthesis-gate) merges member outputs. Writing a consolidated report **without** running those `Task` calls first is a **violation**, not an optimization.
3. **Forbidden rationalizations** — Do not skip spawns because you already read the repo, expect overlapping findings, want lower latency, want to save tokens, or the diff is “docs-only,” “skills/agent-infra,” or “single theme.”
4. **Valid skips** — Omit parallel spawns only when: the user declines or asks for a single pass; the job matches [Fit check](#fit-check) **and no entry skill already invoked parallel dispatch**; the host cannot run `Task`; or only one member was planned.

**Model routing:** Apply [Model assignment](#model-assignment) / [model-routing.md](references/model-routing.md) per member. On usage-limit / credit exhaustion → [Usage-limit retry](references/model-routing.md#usage-limit-retry).

## Fit check

Before planning `N ≥ 2`, name a **single-pass rival**: the same job done by one agent with a deeper primary pass and more tool use in one contiguous context. Spawn parallel members only when slices are **independent** _and_ the rival cannot cover that independence (different sources of truth, kill-mandate asymmetry, or true breadth).

**Use multi** when members are independent and parallel work improves coverage, speed, or confidence — e.g. multi-source gathering, broad exploration, orthogonal research topics, or mixed gather passes.

**Skip multi** when the single-pass rival suffices, work is sequential, members would duplicate without adding confidence, or the user wants a single authoritative pass.

**Entry-skill carve-out:** When `code-review` (or another entry skill) escalated to parallel dispatch / council, when `second-opinion` mandates staged debate, or when `iterative-review` mandates blind review spawn, Fit check does **not** apply. Do not re-litigate “one agent suffices.” Follow that skill’s member budget and [Non-negotiables](#non-negotiables).

## Dispatch modes

- **Coverage** — Split by source, subsystem, domain, or artifact. Example: one member maps data flow, another maps call sites.
- **Perspective** — Same material, distinct stance. Model diversity alone is not enough if prompts are identical.
- **Adversarial** — Specialization of Perspective: kill mandates, context asymmetry, convergent/divergent synthesis. Full recipe → [adversarial.md](references/adversarial.md).
  - **Parallel** — one wave; independent members (`code-review` when escalated; `investigate` when contested).
  - **Staged debate** (`Goal: adversarial-staged`) — wave 1 attackers → wave 2 defender who may receive coordinator-composed wave-1 briefs. Allowed sequential exception to same-wave isolation; not live inter-member chat.

**Hard rule:** Never run parallel members with identical model plus identical prompt. When all members inherit Auto, diversify via distinct prompts and/or stances — shared Auto is expected. Adversarial cross-model diversity → [adversarial.md](references/adversarial.md) § Model routing overlay (named parent or user request only; never escalate tier just to diversify).

## Workflow

### 1. Classify

Load the entry skill's recipe when one applies; otherwise plan manually:

- Job type: `research` | `explore` | `gather` | `mixed`
- Source of truth: `web` | `repo` | `plan`
- Goal: coverage | perspectives | adversarial | adversarial-staged | both
- Independence: if members in the **same wave** need each other's output, that is sequential — do not parallel-spawn them. **Exception:** staged debate ([adversarial.md](references/adversarial.md) § B) runs wave 2 after wave 1 with coordinator-composed briefs.

### 2. Plan and spawn

1. **Discover** — [agent-discovery.md](references/agent-discovery.md) when council agents may apply; otherwise pick host built-in `subagent_type` values directly.
2. **Dispatch plan** — write before spawning. Include **Single-pass rival** (why one agent + deeper pass is insufficient) unless the entry-skill carve-out applies.

```markdown
Task: [What the user asked]
Classification: [research / explore / gather / mixed]
Source of truth: [web / repo / plan]
Goal: [coverage / perspectives / adversarial / adversarial-staged / both]
Single-pass rival: [one agent + deeper pass — why insufficient, or "entry-skill carve-out"]

Parent model: [Auto | <named model>]
User model overrides: [none | member=slug, …]
Auto reachable: [inherit-auto | model=auto | no]
Host supports: [Task model enum values checked]
Billing pool: [first-party | API | mixed]
Explicit model slugs used: [none | slug + slice-fit reason + cost note]
Fast variants used: [none | slug + explicit latency reason]

Selected members:

- [subagent_type] · tier=[Fast|Standard|Premium] · model=[inherit-auto | slug] · stance=[id or n/a]: [sub-task and expected output]
- [subagent_type] · tier=[Fast|Standard|Premium] · model=[inherit-auto | slug] · stance=[id or n/a]: [sub-task and expected output]

Why these members: [brief justification]
Synthesis plan: [how outputs will be merged or adjudicated]
```

`inherit-auto` is a **dispatch-plan sentinel only** — it means omit the Task/Subagent `model` argument. It is not a model slug. Never translate `inherit-auto` into an arbitrary explicit slug. Pass `model=auto` only when the host Task enum explicitly includes `auto`.

3. **Pre-spawn gate** — run [Pre-spawn model-routing gate](references/model-routing.md#pre-spawn-model-routing-gate) and [fail closed](references/model-routing.md#fail-closed-do-not-spawn) on contradictions. Do not issue Task/Subagent calls until every member has a resolved model action that agrees with the plan.
4. **Spawn** — one Task per member in parallel. Compose prompts per [task-prompt.md](references/task-prompt.md). **Plan vs tool syntax:** plan `model=inherit-auto` → omit `model` on the tool call; plan `model=<slug>` → pass `model="<slug>"` only when that slug is in the host enum. On usage/credit failures → [Usage-limit retry](references/model-routing.md#usage-limit-retry).

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
3. High-stakes contradiction → single sequential tiebreaker per [model-routing.md](references/model-routing.md) (prefer Auto, else most appropriate stronger model) or escalate to the user.
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

Use the Task tool's allowed `model` enum from the current host. Never invent slugs. **Optimize for cheapest good enough** — not most capable by default.

Full procedure → [model-routing.md](references/model-routing.md): [Routing precedence (canonical order)](references/model-routing.md#routing-precedence-canonical-order), [Parent-aware routing](references/model-routing.md#parent-aware-routing-auto-first), [Plan vs tool syntax](references/model-routing.md#parent-aware-routing-auto-first), [Pre-spawn model-routing gate](references/model-routing.md#pre-spawn-model-routing-gate), [Fail closed (do not spawn)](references/model-routing.md#fail-closed-do-not-spawn), [Explicit routing (named parent only)](references/model-routing.md#explicit-routing-named-parent-only), [Anti-fast (parallel)](references/model-routing.md#anti-fast-parallel), [Reach Auto](references/model-routing.md#reach-auto), [Usage-limit retry](references/model-routing.md#usage-limit-retry).

**Invariant:** `Parent model = Auto` + no user model override ⇒ every Task/Subagent call **omits** the `model` property. `inherit-auto` is a **dispatch-plan sentinel only** — never translate it into an arbitrary explicit slug. Tier labels never select a slug under an Auto parent.

## Agent count

| Scope  | Count | When                                        |
| ------ | ----- | ------------------------------------------- |
| Small  | 2–3   | Focused feature, explore + verify           |
| Medium | 4–6   | Multiple related areas or mixed gather      |
| Large  | 7–10  | Broad exploration or comprehensive research |

More than 10 members — split into multiple `multi` runs.

## Limitations

- 10 member maximum
- Same-wave members work independently; no inter-member communication (staged debate wave 2 may receive coordinator-composed wave-1 briefs — [adversarial.md](references/adversarial.md))
- Best for parallel independent work, not sequential workflows (except adversarial-staged)
- Startup overhead makes it wasteful for tiny tasks

## Output format

Follow [output-schema.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/output-schema.md). Consolidated runs use [references/output-format.md](references/output-format.md).

## Consumer bindings

Project recipe index and council agent paths arrive as project-specific injected context on skill read. Do not edit synced copies in place.
