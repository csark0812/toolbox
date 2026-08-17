---
name: council
description: Multi-agent orchestrator — invent useful perspectives for a named job, spawn Task members with relevant-but-different context, synthesize. Use when the user attaches or names council for multi-perspective depth on a plan, review, probe, or similar job. Not single-pass process critique (second-opinion alone), cross-session handoff, or blind iterate pass loops.
---

# Council

<!-- source-of-truth: in-session multi-agent depth — invent perspectives, spawn differentiated Task members, synthesize. -->
<!-- doc-meta: owner=eng | last-reviewed=2026-08-17 -->

**Orchestrator** — wires coordinator ↔ member agents for a named job. Process skills are **atoms** (what the work means); this skill owns _how_ multi-perspective members are spawned and merged. Shared vocabulary → [context-pack.md](references/context-pack.md).

References: [context-pack.md](references/context-pack.md) · [task-prompt.md](references/task-prompt.md) · [task-splitting.md](references/task-splitting.md) · [model-routing.md](references/model-routing.md) · [adversarial.md](references/adversarial.md) · [agent-discovery.md](references/agent-discovery.md) · [member-schema.md](references/member-schema.md) · [output-format.md](references/output-format.md).

## Entry gate

- User **attaches or names council** (alone or layered with a process skill) and wants multi-perspective depth on a concrete job + subject (artifact, slice, hunch, review surface).
- If the user only wants a single-pass critique with no multi-agent depth, stop pointing at council — use the process skill alone (e.g. **second-opinion**).

## Non-negotiables

1. **Invent perspectives** — kebab-case stances or lenses from the job and ask. Never filler-cast to hit a headcount.
2. **≤100k total context — hard ceiling** — coordinator material + every member prompt + cited excerpts in one dispatch run must stay **under 100,000 tokens**. Split, shrink, or serialise — never exceed ([task-splitting.md](references/task-splitting.md)).
3. **Spawn real members** — one host **Task** per planned member. Parallel `read_file` / `grep` are **not** substitutes.
4. **Differentiated context** — never parallel members with identical model **and** identical prompt. Diversify via perspective mandates and packs. Shared Auto (`inherit-auto`) is expected.
5. **Synthesis after members** — merge only after planned Tasks complete. Writing synthesis without completed Task runs is a **violation**.
6. **Cheapest good enough** — [model-routing.md](references/model-routing.md); Auto parent ⇒ omit tool `model`.

**Valid skips:** user declines spawn; host cannot run Task; single invented perspective and user accepts coordinator-only (record why).

## When layered with a process skill

Council invents perspectives (or coverage slices). Each member runs the **layered process skill’s** craft under one mandate. Synthesis emits that skill’s exit shape. Council alone → [output-format.md](references/output-format.md).

Worked examples (not an exclusive set) — same pattern for any other process skill the user layers:

| Layer                            | Perspective invent          | Member craft                                                                | Exit                         |
| -------------------------------- | --------------------------- | --------------------------------------------------------------------------- | ---------------------------- |
| **council** + **second-opinion** | one perspective each        | critique craft under that mandate                                           | Bottom line / Action         |
| **council** + **code-review**    | lenses / path slices        | review how-to                                                               | findings                     |
| **council** + **probe**          | gather / perspective slices | Evidence / Fix gates on the subject                                         | Evidence / Fix shape         |
| **council** alone                | for the user-named task     | Member schema + coordinator [output-format.md](references/output-format.md) | Consolidated dispatch report |

## Workflow

### 1. Classify

- Job: process skill name if attached, else user-named task
- Subject: artifact path/paste, slice, hunch target, or review surface
- Goal: `perspectives` \| `coverage` \| `adversarial` (critique-shaped → [adversarial.md](references/adversarial.md))

### 2. Invent and plan

1. Invent 2–6 useful perspectives (or coverage slices) — ask once if the job is too vague.
2. Optional: [agent-discovery.md](references/agent-discovery.md) when workspace council agents apply.
3. Write a dispatch plan before spawning (template below).
4. Pre-spawn gate → [model-routing.md](references/model-routing.md#pre-spawn-model-routing-gate).

```markdown
Task: [What the user asked]
Job: [process skill | user-named task]
Subject: [artifact / slice / surface]
Goal: [perspectives / coverage / adversarial]
Single-pass rival: [why one coordinator pass is insufficient]

Parent model: [Auto | <named model>]
User model overrides: [none | member=slug, …]
Cheapest path: [inherit-auto | model=auto | explicit slug + why]

Selected members:

- [subagent_type] · tier=[Fast|Standard|Premium] · model=[inherit-auto | slug] · perspective=[id]: [one-line mandate]

Why these perspectives: [one clause]
Token budget: [estimated — must sum <100k]
Synthesis plan: [merge into job-skill exit shape | output-format.md]
```

### 3. Spawn

Compose prompts per [task-prompt.md](references/task-prompt.md) + [context-pack.md](references/context-pack.md). `model=inherit-auto` → **omit** tool `model`.

**Type defaults:** repo map → `explore`; web docs → `docs-researcher`; critique / stance → `generalPurpose`; workspace council agent when scored available ([agent-discovery.md](references/agent-discovery.md)).

### 4. Synthesize

1. Merge agreeing findings once.
2. Preserve conflicts — do not flatten.
3. High-stakes contradiction → one sequential tiebreaker ([model-routing.md](references/model-routing.md)) or ask user.
4. Emit the **job skill’s** exit artifact when layered; else [output-format.md](references/output-format.md).

## Output format

Follow [output-schema.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/output-schema.md). Job skill owns final shape when layered; generic runs → [output-format.md](references/output-format.md).

## Consumer bindings

Project recipe index and council agent paths arrive as injected context on skill read. Do not edit synced copies in place.
