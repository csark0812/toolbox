---
name: second-opinion
description: Multiple independent perspectives on a written plan (path or paste) — full staged debate or light cast by depth. Process skill; member runs → subagents second-opinion-dispatch. Composes on plan Artifact or plan-section Slice. Not dialogue-only design, blind code slice passes, or find-only hunch settlement.
---

# Second opinion

**Source of truth for** what plan review perspectives mean and how to synthesize them.

<!-- doc-meta: owner=eng | last-reviewed=2026-08-06 -->

**Process skill** — shared vocabulary → [context-pack.md](../subagents/references/context-pack.md). **A2A wiring** → [`subagents`](../subagents/SKILL.md) [second-opinion-dispatch.md](../subagents/references/second-opinion-dispatch.md).

References: [plan-review.md](references/plan-review.md) · [output.md](references/output.md).

Read [research-basis.md](references/research-basis.md) only when calibrating debate claims.

## Entry gate

- **Artifact** — written plan-shaped content: path on disk **or** in-thread paste/chat draft.
- Fuzzy intent with nothing written → stop; point to **grill** (do not substitute live dialogue for a plan body).

## Non-negotiables

1. **Cast routing** — select full or light per [plan-review.md](references/plan-review.md); light is first-class, not a violation.
2. **Claim anchoring** — kills map to plan § or premise id; unanchored → `drift`.
3. **Selected cast before final report** — coordinator-only critique without member runs is a **violation** ([dispatch](../subagents/references/second-opinion-dispatch.md)).

## Workflow

1. **Locate artifact** — path on disk or paste/draft in thread.
2. **Select cast** — [plan-review.md](references/plan-review.md): explicit user → clear intent signals → one ask if ambiguous → full when clearly deep.
3. **Premise surface** — [plan-review.md](references/plan-review.md): 3–6 premises; confirm with user if unsettled (skip or shrink for fleeting light casts when premises are already explicit in the draft).
4. **Run perspectives** — **subagents** [second-opinion-dispatch.md](../subagents/references/second-opinion-dispatch.md) for the selected cast; large full-cast plans → optional [second-opinion-evidence-dispatch.md](../subagents/references/second-opinion-evidence-dispatch.md).
5. **Synthesize** — [plan-review.md](references/plan-review.md) + [output.md](references/output.md).

**Full cast:** wave 1 `premises` + `completeness` (artifact only) → wave 2 `defend` (artifact + 2–4 cited primary sources + attacker briefs). **Light cast:** exactly one wave-1 stance; defender only if user asked or kills need rebuttal (fleeting default: no defender). Do not ask user for source paths already in the plan.

When **iterate** uses the plan-section adapter on the same sections, second-opinion covers full-artifact perspectives; iterate covers slice cohesion — both may apply if the layered prompt names them.

## Exit artifact

Per [output.md](references/output.md) — user-facing **Bottom line** + **Action items** only (no Gaps / Risky assumptions / Debate tags dump).

## Consumer bindings

Plan artifact paths arrive as injected context on skill read. Do not edit installed copies in place.

## Output format

Follow [output-schema.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/output-schema.md). Details → [references/output.md](references/output.md).
