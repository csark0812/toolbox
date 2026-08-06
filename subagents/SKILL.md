---
name: subagents
description: Subagent dispatch — pick subagent_type, split tasks token-efficiently, cheapest good-enough model. Latches on via host recipes that say via subagents or when a Task/Subagent call is imminent. Use when spawning Task/Subagent, planning independent slices, or a host recipe mandates dispatch. Not for primary-only passes without spawn (code-review default) or dialogue (grill, crystallize).
---

# Subagents

**Source of truth for** effective Task/Subagent utilization — type selection, token-efficient splits, and cost-aware model routing.

<!-- doc-meta: owner=eng | last-reviewed=2026-08-06 -->

Host **Task** tool (Cursor: **Subagent**). Host recipes own domain process and synthesis; this skill latches on as the **how** overlay — not a separate takeover job.

References: [subagent-types.md](references/subagent-types.md) · [task-splitting.md](references/task-splitting.md) · [model-routing.md](references/model-routing.md) · [adversarial.md](references/adversarial.md) · [task-prompt.md](references/task-prompt.md) · [member-schema.md](references/member-schema.md) · [output-format.md](references/output-format.md) · [agent-discovery.md](references/agent-discovery.md).

Read [references/research-basis.md](references/research-basis.md) when calibrating spawn or cost claims. Do not load by habit.

## Compose contract

Recipes own job, member budget, and domain output (the process). When recipe text says `via subagents` or a Task/Subagent call is imminent, this skill **latches on as extra context**: it owns type selection, splits, model routing, member prompts, and the synthesis gate. It **must not replace the recipe** process or become a separate detour job. Write the **dispatch plan before the first Task**.

## Quick reference

| Need                         | Where                                                          |
| ---------------------------- | -------------------------------------------------------------- |
| Which `subagent_type` when   | [references/subagent-types.md](references/subagent-types.md)   |
| Token-efficient slice splits | [references/task-splitting.md](references/task-splitting.md)   |
| Cheapest good-enough model   | [references/model-routing.md](references/model-routing.md)     |
| Adversarial / staged debate  | [references/adversarial.md](references/adversarial.md)         |
| Member prompt template       | [references/task-prompt.md](references/task-prompt.md)         |
| Per-member output shape      | [references/member-schema.md](references/member-schema.md)     |
| Consolidated report          | [references/output-format.md](references/output-format.md)     |
| Council agent discovery      | [references/agent-discovery.md](references/agent-discovery.md) |

## Non-negotiables

When this skill applies (user attached `subagents`, a host recipe says `via subagents`, or the plan includes Task members):

1. **Spawn real members** — one host **Task** per planned member with chosen `subagent_type` and model per [Model assignment](#model-assignment). Parallel `read_file` / `grep` / other tools are **not** substitutes for member runs.
2. **Synthesis runs after members** — merge member outputs before the consolidated report. Writing synthesis **without** completed Task runs is a **violation**.
3. **Forbidden rationalizations** — do not skip spawns because you already read the repo, want lower latency, or want to save tokens **when the host recipe or plan already committed to dispatch**.
4. **Valid skips** — user declines spawn; [When-not-to-spawn](#when-not-to-spawn) passes **and** no [recipe carve-out](#recipe-carve-out); host cannot run Task; only one member planned and single-pass suffices **and** no recipe carve-out.

**Cost default:** [Cheapest good enough](references/model-routing.md) — Auto / omit `model` under Auto parent; never default to premium or `*-fast` in parallel.

## When-not-to-spawn

Before `N ≥ 2`, name a **single-pass rival**: one coordinator with deeper tool use in one context. Spawn only when slices are **independent** and the rival cannot cover them ([task-splitting.md](references/task-splitting.md)).

**Skip subagents** when the rival suffices, work is sequential, members would duplicate without added confidence, or the user wants one authoritative pass.

## Recipe carve-out

When a host recipe **mandates** Task spawn, do not re-litigate “one agent suffices.” Follow that recipe’s member budget and [Non-negotiables](#non-negotiables).

| Shape                | Members | When                           |
| -------------------- | ------- | ------------------------------ |
| **Blind single**     | 1       | Memoryless slice review        |
| **Parallel council** | 2–6     | Independent lenses or coverage |
| **Staged debate**    | 2 + 1   | Wave attackers → defender      |
| **Compact writer**   | 1       | Single compact artifact writer |

Type and model defaults → [subagent-types.md](references/subagent-types.md). No entry-skill roster and no sibling path-links from this skill.

## One vs many

| Pattern               | Members     | When                                                                                      |
| --------------------- | ----------- | ----------------------------------------------------------------------------------------- |
| **Single subagent**   | 1           | Blind review pass, one slice, sequential debate defender, tiebreaker                      |
| **Parallel coverage** | 2–6 typical | Independent sources, areas, or topics ([task-splitting.md](references/task-splitting.md)) |
| **Staged debate**     | 2 + 1       | Wave attackers → defender ([adversarial.md](references/adversarial.md) § B)               |

More than 10 members — split into multiple dispatch runs.

## Dispatch modes

- **Coverage** — split by source, subsystem, or artifact ([task-splitting.md](references/task-splitting.md)).
- **Perspective** — same material, distinct stance; diversify prompts/stances, not premium models by default.
- **Adversarial** — kill mandates, context asymmetry → [adversarial.md](references/adversarial.md).

**Hard rule:** never parallel members with identical model **and** identical prompt. Shared Auto (`inherit-auto`) is expected — diversify via [subagent-types.md](references/subagent-types.md) and stances.

## Workflow

### 1. Classify

Load the host recipe when one applies; else plan manually:

- Job: `research` \| `explore` \| `gather` \| `review` \| `mixed`
- Source of truth: `web` \| `repo` \| `plan`
- Goal: coverage \| perspectives \| adversarial \| adversarial-staged
- Pick `subagent_type` per member → [subagent-types.md](references/subagent-types.md)
- Split slices for minimum total tokens → [task-splitting.md](references/task-splitting.md)

### 2. Plan and spawn

1. **Discover** — [agent-discovery.md](references/agent-discovery.md) when council agents may apply.
2. **Dispatch plan** — write before spawning (template below). Include **single-pass rival** unless carve-out applies. Keep `subagent_type` / stance in this **plan table** (secondary channel)—not as the member’s opening salutation.
3. **Pre-spawn gate** — [model-routing.md](references/model-routing.md#pre-spawn-model-routing-gate); fail closed on contradictions.
4. **Spawn** — compose prompts per [task-prompt.md](references/task-prompt.md). `model=inherit-auto` → **omit** tool `model`.

```markdown
Task: [What the user asked]
Classification: [research / explore / gather / review / mixed]
Source of truth: [web / repo / plan]
Goal: [coverage / perspectives / adversarial / adversarial-staged]
Single-pass rival: [why one pass insufficient, or "recipe carve-out"]

Parent model: [Auto | <named model>]
User model overrides: [none | member=slug, …]
Cheapest path: [inherit-auto | model=auto | explicit slug + why Auto insufficient]

Selected members:

- [subagent_type] · tier=[Fast|Standard|Premium] · model=[inherit-auto | slug] · stance=[id]: [minimal sub-task — see task-splitting.md]

Why these types: [subagent-types.md rationale]
Token budget: [why this split minimizes duplicate context]
Synthesis plan: [merge / adjudicate]
```

### 3. Synthesize

Apply the [synthesis gate](#synthesis-gate).

## Synthesis gate

**Prerequisite:** at least one completed Task per planned member (unless valid skip).

1. Merge agreeing findings once.
2. Preserve conflicts — do not flatten.
3. High-stakes contradiction → one sequential tiebreaker ([model-routing.md](references/model-routing.md)) or ask user.
4. Report per [output-format.md](references/output-format.md); domain shape → host recipe.

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

Follow [output-schema.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/output-schema.md). Consolidated runs → [output-format.md](references/output-format.md).

## Consumer bindings

Project recipe index and council paths arrive as injected context on skill read. Do not edit synced copies in place.
