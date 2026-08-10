---
name: second-opinion
description: Adversarial critique of a written artifact (path or paste) — invent lenses from the ask; light/med/deep token ceilings. Process skill; med/deep → subagents second-opinion-dispatch. Composes on Artifact or plan-section Slice. Not dialogue-only design, blind code slice passes, or find-only hunch settlement.
---

# Second opinion

**Source of truth for** adversarial artifact review — invent lenses, depth ceilings, synthesis.

<!-- doc-meta: owner=eng | last-reviewed=2026-08-10 -->

**Process skill** — shared vocabulary → [context-pack.md](../subagents/references/context-pack.md). **A2A wiring** → [`subagents`](../subagents/SKILL.md) [second-opinion-dispatch.md](../subagents/references/second-opinion-dispatch.md).

References: [plan-review.md](references/plan-review.md) · [output.md](references/output.md).

Read [research-basis.md](references/research-basis.md) only when calibrating debate claims.

## Entry gate

- **Artifact** — written plan-shaped content: path on disk **or** in-thread paste or chat draft.
- If intent is fuzzy with nothing written, stop. Point to **grill**. Do not substitute live dialogue for a plan body.

## Non-negotiables

1. **Invent lenses first** — kebab-case kill-mandate lenses from the ask; then pick the cheapest depth ceiling that fits ([plan-review.md](references/plan-review.md)). Never filler lenses to match a tier.
2. **Claim anchoring** — kills map to artifact §, draft heading, or premise id; unanchored → `drift`.
3. **Depth gates** — **light** = coordinator-only (no subagents). **Med/deep** = real member runs before final report ([dispatch](../subagents/references/second-opinion-dispatch.md)).

## Workflow

1. **Locate artifact** — path on disk or paste or draft in thread.
2. **Invent lenses** — from the ask; one pre-spawn ask if too vague (bare “second opinion” → ask depth + what to pressure; do not silently invent premises+completeness).
3. **Select depth** — cheapest ceiling for lens count and debate need ([plan-review.md](references/plan-review.md)).
4. **Run** — light: coordinator applies one lens. Med/deep: **subagents** [second-opinion-dispatch.md](../subagents/references/second-opinion-dispatch.md). Large deep runs → optional [second-opinion-evidence-dispatch.md](../subagents/references/second-opinion-evidence-dispatch.md).
5. **Synthesize** — [plan-review.md](references/plan-review.md) + [output.md](references/output.md).

**Depth ceilings:** **Light** = 1 lens, no Tasks · **Med** = 1 attacker + 1 defender · **Deep** = 2–3 parallel attackers + 1 defender (extra round only if a ship-block kill stays open after defend, or user asks).

Named lenses (`premises`, `completeness`, `brand-fit`, …) in docs are **worked examples only** — not a cast menu. `verify.md` overlay applies only when the invented lens is readiness/gaps-shaped `completeness`.

When **iterate** uses the plan-section adapter on the same sections, second-opinion covers full-artifact perspectives. Iterate covers slice cohesion. Both apply if the layered prompt names them.

## Exit artifact

Per [output.md](references/output.md) — user-facing **Bottom line** + **Action items** only (no Gaps / Risky assumptions / Debate tags dump). Write those blocks in pragmatic STE.

## Consumer bindings

Plan artifact paths arrive as injected context on skill read. Do not edit installed copies in place.

## Output format

Follow [output-schema.md](https://raw.githubusercontent.com/csark0812/toolbox/main/.skeleton/references/output-schema.md). Details → [references/output.md](references/output.md).
