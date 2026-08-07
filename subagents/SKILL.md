---
name: subagents
description: Agent-to-agent spawn — subagent_type, extremely token-efficient splits (≤100k total context), context-pack envelopes, cheapest good-enough model. Use when spawning Task/Subagent or an entry orchestrator mandates dispatch. Not for process-only coordinator work without spawn (code-review default, grill).
---

# Subagents

**Source of truth for** agent-to-agent Task spawn — type selection, token-efficient splits, and cost-aware model routing.

<!-- doc-meta: owner=eng | last-reviewed=2026-08-07 -->

**Orchestrator** — wires coordinator ↔ member agents. Process skills are **atoms** that compose via [context-pack.md](references/context-pack.md). This skill owns _how_ members are spawned and what they receive.

References: [context-pack.md](references/context-pack.md) · [second-opinion-dispatch.md](references/second-opinion-dispatch.md) · [explore-escalation-dispatch.md](references/explore-escalation-dispatch.md) · [review-council-dispatch.md](references/review-council-dispatch.md) · [subagent-types.md](references/subagent-types.md) · [task-splitting.md](references/task-splitting.md) · [model-routing.md](references/model-routing.md) · [adversarial.md](references/adversarial.md) · [task-prompt.md](references/task-prompt.md) · [member-schema.md](references/member-schema.md) · [output-format.md](references/output-format.md) · [agent-discovery.md](references/agent-discovery.md).

Read [references/research-basis.md](references/research-basis.md) when you calibrate spawn or cost claims. Do not load by habit.

## Quick reference

| Need                         | Where                                                                    |
| ---------------------------- | ------------------------------------------------------------------------ |
| Member context / token rules | [references/context-pack.md](references/context-pack.md)                 |
| Process dispatch recipes     | second-opinion · explore-escalation · review-council dispatch refs below |
| Which `subagent_type` when   | [references/subagent-types.md](references/subagent-types.md)             |
| Token-efficient slice splits | [references/task-splitting.md](references/task-splitting.md)             |
| Cheapest good-enough model   | [references/model-routing.md](references/model-routing.md)               |
| Adversarial / staged debate  | [references/adversarial.md](references/adversarial.md)                   |
| Member prompt template       | [references/task-prompt.md](references/task-prompt.md)                   |
| Per-member output shape      | [references/member-schema.md](references/member-schema.md)               |
| Consolidated report          | [references/output-format.md](references/output-format.md)               |
| Council agent discovery      | [references/agent-discovery.md](references/agent-discovery.md)           |

## Non-negotiables

When this skill applies (user attached `subagents`, an entry skill invokes dispatch, or the plan includes Task members):

1. **≤100k total context — hard ceiling** — combined coordinator material + every member prompt + cited excerpts in one dispatch run must stay **under 100,000 tokens**. If over budget, split into another dispatch run, shrink slices, drop bodies for pointers, or serialise members. **Never** exceed 100k. Budget in the dispatch plan ([task-splitting.md](references/task-splitting.md)).
2. **Spawn real members** — one host **Task** per planned member with chosen `subagent_type` and model per [Model assignment](#model-assignment). Parallel `read_file` / `grep` / other tools are **not** substitutes for member runs.
3. **Synthesis runs after members** — merge member outputs before the consolidated report. Writing synthesis **without** completed Task runs is a **violation**.
4. **Forbidden rationalizations** — do not skip spawns because you already read the repo, want lower latency, or want to save tokens **when the entry skill or plan already committed to dispatch**.
5. **Valid skips** — user declines spawn. [When-not-to-spawn](#when-not-to-spawn) passes **and** no [entry-skill carve-out](#entry-skill-carve-out). Host cannot run Task. Only one member planned and single-pass suffices **and** no entry-skill carve-out.

**Cost default:** [Cheapest good enough](references/model-routing.md) — Auto / omit `model` under Auto parent. Never default to premium or `*-fast` in parallel.

## When-not-to-spawn

Before `N ≥ 2`, name a **single-pass rival**: one coordinator with deeper tool use in one context. Spawn only when slices are **independent** and the rival cannot cover them ([task-splitting.md](references/task-splitting.md)).

**Skip subagents** when the rival suffices, work is sequential, members duplicate without more confidence, or the user wants one authoritative pass.

## Entry-skill carve-out

When an orchestrator or process skill **mandates** Task spawn, do not re-litigate “one agent suffices.” Follow that recipe’s member budget and [Non-negotiables](#non-negotiables).

| Entry skill        | Spawn shape                           | Recipe lives in                                                                         |
| ------------------ | ------------------------------------- | --------------------------------------------------------------------------------------- |
| **second-opinion** | Full or light cast (path or paste)    | [second-opinion-dispatch.md](references/second-opinion-dispatch.md)                     |
| **iterate**        | Single blind member per pass          | [iterate blind-reviewer-dispatch](../iterate/references/blind-reviewer-dispatch.md)     |
| **handoff**        | Single compact member (model-invoked) | [handoff handoff-subagent-dispatch](../handoff/references/handoff-subagent-dispatch.md) |

Type and model defaults for each → [subagent-types.md](references/subagent-types.md).

## One vs many

| Pattern               | Members     | When                                                                                      |
| --------------------- | ----------- | ----------------------------------------------------------------------------------------- |
| **Single subagent**   | 1           | Blind review pass, one slice, sequential debate defender, tiebreaker                      |
| **Parallel coverage** | 2–6 typical | Independent sources, areas, or topics ([task-splitting.md](references/task-splitting.md)) |
| **Staged debate**     | 2 + 1       | Wave attackers → defender ([adversarial.md](references/adversarial.md) § B)               |

If you need more than 10 members, split into multiple dispatch runs.

## Dispatch modes

- **Coverage** — split by source, subsystem, or artifact ([task-splitting.md](references/task-splitting.md)).
- **Perspective** — same material, distinct stance. Diversify prompts and stances. Do not default to premium models.
- **Adversarial** — kill mandates, context asymmetry → [adversarial.md](references/adversarial.md).

**Hard rule:** never parallel members with identical model **and** identical prompt. Shared Auto (`inherit-auto`) is expected. Diversify via [subagent-types.md](references/subagent-types.md) and stances.

## Workflow

### 1. Classify

Load the entry skill recipe when one applies. Else plan manually:

- Job: `research` \| `explore` \| `gather` \| `review` \| `mixed`
- Source of truth: `web` \| `repo` \| `plan`
- Goal: coverage \| perspectives \| adversarial \| adversarial-staged
- Pick `subagent_type` per member → [subagent-types.md](references/subagent-types.md)
- Split slices for minimum total tokens → [task-splitting.md](references/task-splitting.md)

### 2. Plan and spawn

1. **Discover** — [agent-discovery.md](references/agent-discovery.md) when council agents can apply.
2. **Dispatch plan** — write before spawning (template below). Include **single-pass rival** unless carve-out applies.
3. **Pre-spawn gate** — [model-routing.md](references/model-routing.md#pre-spawn-model-routing-gate). Fail closed on contradictions.
4. **Spawn** — compose prompts per [task-prompt.md](references/task-prompt.md). If `model=inherit-auto`, **omit** tool `model`.

```markdown
Task: [What the user asked]
Classification: [research / explore / gather / review / mixed]
Source of truth: [web / repo / plan]
Goal: [coverage / perspectives / adversarial / adversarial-staged]
Single-pass rival: [why one pass is insufficient, or "entry-skill carve-out"]

Parent model: [Auto | <named model>]
User model overrides: [none | member=slug, …]
Cheapest path: [inherit-auto | model=auto | explicit slug + why Auto is insufficient]

Selected members:

- [subagent_type] · tier=[Fast|Standard|Premium] · model=[inherit-auto | slug] · stance=[id]: [minimal sub-task — see task-splitting.md]

Why these types: [subagent-types.md rationale]
Token budget: [estimated tokens — must sum <100k across all members + coordinator excerpts]
Synthesis plan: [merge / adjudicate]
```

### 3. Synthesize

Apply the [synthesis gate](#synthesis-gate).

## Synthesis gate

**Prerequisite:** at least one completed Task per planned member (unless valid skip).

1. Merge agreeing findings once.
2. Preserve conflicts. Do not flatten.
3. If there is a high-stakes contradiction, run one sequential tiebreaker ([model-routing.md](references/model-routing.md)) or ask the user.
4. Report per [output-format.md](references/output-format.md). Domain shape → entry skill.

## Model assignment

**Cheapest good enough** — not most capable by default. Full procedure → [model-routing.md](references/model-routing.md).

**Invariant:** `Parent model = Auto` + no override ⇒ every Task call **omits** `model`. `inherit-auto` is a plan sentinel only.

## Fallback matrix

| Need          | Prefer                    | Fallback                         |
| ------------- | ------------------------- | -------------------------------- |
| Repo map      | `explore`                 | `generalPurpose`                 |
| Web docs      | `docs-researcher`         | `generalPurpose`                 |
| Plan critique | `generalPurpose` + stance | council if HOST + `plan` context |

Log fallbacks in [availability log](references/agent-discovery.md#availability-log-required-in-dispatch-plan).

## Output format

Follow [output-schema.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/output-schema.md). Consolidated runs → [output-format.md](references/output-format.md). User-facing consolidated reports use pragmatic STE when the entry skill marks them user-facing.

## Consumer bindings

Project recipe index and council paths arrive as injected context on skill read. Do not edit synced copies in place.
